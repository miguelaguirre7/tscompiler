import { Token, ValidToken } from '../token';
import regex from '../util/regex';
import logError, { ErrorCodes, Errors } from '../error';
import { ContextualKeywords, Punctuator, ReservedWord } from '../types';
import punctuators from './punctuators';
import reservedWords from './reserved_words';

export default class Lexer {
	private _input: string;
	private currentChar: string;
	private currentIndex: number;
	private _currentLine: number;
	private readonly _errors: Map<number, ErrorCodes>;
	/* eslint-disable-next-line  @typescript-eslint/class-literal-property-style, @typescript-eslint/naming-convention */
	private readonly MAX_UNICODE_ESCAPE_VALUE = 0x10_FF_FF;
	private readonly _eofToken: Token;

	constructor(input: string) {
		this._input = input;
		this.currentIndex = 0;
		this.currentChar = this._input[this.currentIndex];
		this._eofToken = new Token(ValidToken.EOF);
		this._currentLine = 1;
		this._errors = new Map();
	}

	get input() {
		return this._input;
	}

	set input(newInput: string) {
		this._input = newInput;
	}

	get eofToken() {
		return this._eofToken;
	}

	get currentLine() {
		return this._currentLine;
	}

	get errors() {
		return this._errors;
	}

	/**
	 * Resets the lexer setting the current character to the first one
	 * in the input
	 * @param newInput Optional new input
	 */

	reset(newInput?: string) {
		if (newInput) {
			this._input = newInput;
		}

		this.currentIndex = 0;
		this.currentChar = this._input[0];
		this._currentLine = 1;
		this._errors.clear();
	}

	/**
	 * Gets the next token in the lexer
	 * @returns The next token recognized by the lexer
	 */
	nextToken(): Token {
		while (this.currentChar) {
			if (regex.ws.test(this.currentChar)) {
				if (this.currentChar === '\n') this._currentLine += 1;
				this.advance();
				continue;
			} else if (regex.commentStart.test(this.currentChar)) {
				return this.comment();
			} else if (regex.operators.test(this.currentChar)) {
				return this.punctuator();
			} else if (regex.numericLiteral.test(this.currentChar)) {
				const number_ = this.numericLiteral();
				return this.isToken(number_) ? number_ : new Token(ValidToken.NUMERIC_LITERAL, number_);
			} else if (regex.string.test(this.currentChar)) {
				const string_ = this.string();
				return this.isToken(string_) ? string_ : new Token(ValidToken.STRING_LITERAL, string_);
			} else if (regex.identifierStart.test(this.currentChar)) {
				return this.word();
			} else {
				const char = this.currentChar;
				this.advance();

				switch (char) {
					case '{': {
						return new Token(ValidToken.OPEN_CURLY_BRACE, '{');
					}

					case '}': {
						return new Token(ValidToken.CLOSE_CURLY_BRACE, '}');
					}

					case '(': {
						return new Token(ValidToken.OPEN_PAREN, '(');
					}

					case ')': {
						return new Token(ValidToken.CLOSE_PAREN, ')');
					}

					case '[': {
						return new Token(ValidToken.OPEN_BRACKET, '[');
					}

					case ']': {
						return new Token(ValidToken.CLOSE_BRACKET, ']');
					}

					case ';': {
						return new Token(ValidToken.SEMICOLON, ';');
					}

					case ':': {
						return new Token(ValidToken.COLON, ':');
					}

					case ',': {
						return new Token(ValidToken.COMMA, ',');
					}

					default: {
						this.error(Errors.Unexpected_Token);
					}
				}
			}
		}

		return this._eofToken;
	}

	private advance(amount = 1) {
		this.currentIndex += amount;
		this.currentChar = this._input[this.currentIndex];
	}

	private peek() {
		return this.input[this.currentIndex + 1];
	}

	private skip(condition: (current: string) => boolean) {
		while (condition(this.currentChar)) this.advance();
	}

	private previousCharacter() {
		return this.input[this.currentIndex - 1];
	}

	private numericLiteral() {
		let number = '';

		while (regex.numericLiteral.test(this.currentChar)) {
			if (regex.decimalDigit.test(this.currentChar)) {
				const restOfNumber = this.decimalIntegerLiteral();
				if (this.isToken(restOfNumber)) return restOfNumber;

				number += restOfNumber;
			} else if (regex.dot.test(this.currentChar)) {
				number += this.currentChar;
				this.advance();

				// Trailing point
				if (this.currentChar === undefined) break;

				const restOfDecimal = this.decimalDigitsSep();
				if (this.isToken(restOfDecimal)) return restOfDecimal;

				number += restOfDecimal;
				break;
			}
		}

		return number;
	}

	private decimalIntegerLiteral() {
		let decimal = this.currentChar;

		if (this.currentChar === '0') {
			this.advance();

			if (regex.decimalDigitsSep.test(this.currentChar)) {
				this.skipRestOfNumber();
				return this.error(Errors.Octal_literals_not_supported);
			}

			return '0';
		}

		if (regex.nonZeroDigit.test(this.currentChar)) {
			this.advance();

			if (regex.decimalDigitsSep.test(this.currentChar)) {
				decimal += this.currentChar;
				this.advance();

				if (this.multipleNumericSeparators()) {
					this.skipRestOfNumber();
					return this.error(Errors.Multiple_numeric_separators_not_allowed);
				}

				if (regex.numericLiteralSeparator.test(this.previousCharacter()) && regex.dot.test(this.currentChar)) {
					this.skip(current => regex.decimalDigitsSep.test(current) || regex.dot.test(current));
					return this.error(Errors.Numeric_separator_not_allowed);
				}

				if (regex.numericLiteralSeparator.test(this.currentChar)) {
					decimal += this.currentChar;
					this.advance();
				}

				const rest = this.decimalDigitsSep();
				if (this.isToken(rest)) return rest;

				decimal += rest;
			}
		}

		return decimal;
	}

	private decimalDigitsSep() {
		let digits = this.currentChar;

		if (regex.numericLiteralSeparator.test(this.currentChar)) {
			return this.error(this.multipleNumericSeparators() ? Errors.Multiple_numeric_separators_not_allowed : Errors.Numeric_separator_not_allowed);
		}

		this.advance();

		while (regex.decimalDigitsSep.test(this.currentChar)) {
			if (this.multipleNumericSeparators()) {
				return this.error(Errors.Multiple_numeric_separators_not_allowed);
			}

			digits += this.currentChar;
			this.advance();
		}

		if (digits.endsWith('_')) return this.error(Errors.Numeric_separator_not_allowed);

		return digits;
	}

	private multipleNumericSeparators() {
		return regex.numericLiteralSeparator.test(this.previousCharacter()) && regex.numericLiteralSeparator.test(this.currentChar);
	}

	private skipRestOfNumber() {
		this.skip(current => regex.decimalDigitsSep.test(current));
	}

	private comment() {
		const nextChar = this.peek();

		if (!regex.commentContinue.test(nextChar)) return this.punctuator();

		return regex.commentStart.test(nextChar) ? this.singleLineComment() : this.multiLineComment();
	}

	private singleLineComment() {
		let comment = this.currentChar;
		this.advance();

		while (this.currentChar !== undefined && !regex.lineTerminators.test(this.currentChar)) {
			comment += this.currentChar;
			this.advance();
		}

		return new Token(ValidToken.SINGLE_LINE_COMMENT, comment);
	}

	private multiLineComment() {
		let comment = this.currentChar;
		this.advance();

		while (this.currentChar !== undefined) {
			comment += this.currentChar;

			if (this.currentChar === '*') {
				const nextChar = this.peek();
				if (regex.commentStart.test(nextChar)) {
					this.advance();
					comment += this.currentChar;
					break;
				}
			}

			this.advance();
		}

		if (this.currentChar === undefined) {
			return this.error(Errors.Unterminated_comment);
		}

		this.advance();

		return new Token(ValidToken.MULTI_LINE_COMMENT, comment);
	}

	private punctuator() {
		const nextChar = this.peek();

		if ((regex.signedInteger.test(this.currentChar) || regex.dot.test(this.currentChar)) && regex.decimalDigit.test(nextChar)) {
			const number = this.decimalDigitsSep();
			return typeof (number) === 'string' ? new Token(ValidToken.NUMERIC_LITERAL, number) : number;
		}

		// Grab the next 4 characters in the input, which is the length of the longest punctuator
		const punctuator = this.input.slice(this.currentIndex, this.currentIndex + 4) as Punctuator;

		// Get the longest punctuator possible
		for (let i = 4; i >= 0; i--) {
			const candidate = punctuator.slice(0, Math.max(0, i)) as Punctuator;
			if (punctuators.has(candidate)) {
				this.advance(candidate.length);
				return punctuators.get(candidate)!();
			}
		}

		return this.error(Errors.Unsupported_punctuator);
	}

	private word() {
		let word = this.currentChar;
		this.advance();

		while (this.currentChar !== undefined && regex.identifierPart.test(this.currentChar)) {
			word += this.currentChar;
			this.advance();
		}

		const token = reservedWords.always.get(word as ReservedWord) ?? reservedWords.contextual.get(word as ContextualKeywords);

		if (token === undefined) return new Token(ValidToken.IDENTIFIER, word);

		return token();
	}

	private string() {
		let string = this.currentChar;
		const quote = this.currentChar;
		const stringCharacterRegex = this.currentChar === '"' ? regex.doubleStringCharacter : regex.singleStringCharacter;

		this.advance();

		while (this.currentChar !== undefined && (regex.singleEscapeFormattingCharacters.test(this.currentChar) || stringCharacterRegex.test(this.currentChar))) {
			if (regex.escapeSequence.test(this.currentChar)) {
				const escapeSeq = this.escapeSequence();
				if (this.isToken(escapeSeq)) return escapeSeq;

				string += escapeSeq;

				// Prevent the loop from breaking when a escaped quote is found
				if (this.currentChar === quote) {
					this.advance();
					continue;
				}
			} else {
				string += this.currentChar;
			}

			// String is complete
			if (this.currentChar === quote) break;

			this.advance();
		}

		if (this.currentChar !== quote) {
			return this.error(Errors.Unterminated_string_literal);
		}

		this.advance();

		return string;
	}

	private escapeSequence() {
		let sequence = this.currentChar;
		this.advance();

		if (regex.singleEscapeNonFormattingCharacters.test(this.currentChar) || regex.nonEscapeCharacter.test(this.currentChar)) {
			sequence += this.currentChar;
		} else if (regex.unicodeEscapeSequence.test(this.currentChar)) {
			const unicodeSeq = this.unicodeSequence();
			if (this.isToken(unicodeSeq)) return unicodeSeq;

			sequence += unicodeSeq;
		}

		return sequence;
	}

	private unicodeSequence() {
		let uSequence = this.currentChar;
		this.advance();

		if (this.currentChar !== '{') {
			return this.error(Errors.Hexadecimal_digit_expected);
		}

		uSequence += this.currentChar;
		this.advance();

		let unicodeValue = this.currentChar;

		while (regex.hexDigit.test(this.currentChar)) {
			uSequence += this.currentChar;
			unicodeValue += this.currentChar;
			this.advance();
		}

		if (this.currentChar === '{') {
			return this.error(Errors.Hexadecimal_digit_expected);
		}

		if (this.currentChar !== '}') {
			return this.error(Errors.Unterminated_unicode_escape_sequence);
		}

		const parsedValue = Number.parseInt(unicodeValue, 16);
		if (parsedValue < 0 || parsedValue > this.MAX_UNICODE_ESCAPE_VALUE) {
			return this.error(Errors.Unicode_value_out_of_range);
		}

		uSequence += this.currentChar;

		return uSequence;
	}

	private error(code: ErrorCodes) {
		logError('placeholder.ts', code, this._currentLine);

		this._errors.set(this._currentLine, code);
		return new Token(ValidToken.NON_VALID_TOKEN);
	}

	private isToken(token: string | Token): token is Token {
		return typeof token !== 'string';
	}
}
