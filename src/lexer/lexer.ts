import { Token, ValidToken } from '../token';
import regex from '../util/regex';
import punctuators from './punctuators';
import reservedWords from './reserved_words';

export default class Lexer {
	private _input: string;
	private currentChar: string;
	private currentIndex: number;
	/* eslint-disable-next-line  @typescript-eslint/class-literal-property-style, @typescript-eslint/naming-convention */
	private readonly MAX_UNICODE_ESCAPE_VALUE = 0x10_FF_FF;
	private readonly _eofToken: Token;

	constructor(input: string) {
		this._input = input;
		this.currentIndex = 0;
		this.currentChar = this._input[this.currentIndex];
		this._eofToken = new Token(ValidToken.EOF);
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
	}

	/**
	 * Gets the next token in the lexer
	 * @returns The next token recognized by the lexer
	 */
	nextToken(): Token {
		while (this.currentChar) {
			if (regex.ws.test(this.currentChar)) {
				this.advance();
				continue;
			} else if (regex.commentStart.test(this.currentChar)) {
				return this.comment();
			} else if (regex.operators.test(this.currentChar)) {
				return this.punctuator();
			} else if (regex.numericLiteral.test(this.currentChar)) {
				return new Token(ValidToken.NUMERIC_LITERAL, this.numericLiteral());
			} else if (regex.string.test(this.currentChar)) {
				return new Token(ValidToken.STRING_LITERAL, this.string());
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
						throw new SyntaxError('Invalid token');
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

	private numericLiteral() {
		let number = '';
		let floatingPointCount = 0;

		while (regex.numericLiteral.test(this.currentChar)) {
			if (regex.decimalDigit.test(this.currentChar)) {
				number += this.decimalIntegerLiteral();
			} else if (regex.dot.test(this.currentChar)) {
				if (floatingPointCount > 0) throw new Error('Invalid number literal');

				floatingPointCount++;
				number += this.decimalDigitsSep();
			}
		}

		return number;
	}

	private decimalIntegerLiteral() {
		let decimal = this.currentChar;

		if (this.currentChar === '0') {
			this.advance();
			if (regex.decimalDigit.test(this.currentChar) || regex.numericLiteralSeparator.test(this.currentChar)) {
				throw new Error('Invalid Octal literal');
			}

			return '0';
		}

		if (regex.nonZeroDigit.test(this.currentChar)) {
			this.advance();

			if (regex.decimalDigit.test(this.currentChar) || regex.numericLiteralSeparator.test(this.currentChar)) {
				decimal += this.currentChar;
				this.advance();

				if (regex.numericLiteralSeparator.test(this.currentChar)) {
					decimal += this.currentChar;
					this.advance();

					if (!regex.decimalDigit.test(this.currentChar)) {
						throw new Error('Numeric separators are not allowed here');
					}
				}

				decimal += this.decimalDigitsSep();
			}
		}

		return decimal;
	}

	private decimalDigitsSep() {
		let digits = this.currentChar;
		this.advance();

		if (regex.numericLiteralSeparator.test(this.currentChar)) {
			throw new Error('Numeric separators are not allowed here');
		}

		while (regex.decimalDigit.test(this.currentChar) || regex.numericLiteralSeparator.test(this.currentChar)) {
			digits += this.currentChar;
			this.advance();
		}

		if (digits.endsWith('_')) throw new Error('Numeric separators are not allowed here');

		return digits;
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
			throw new Error('*/ expected.');
		}

		this.advance();

		return new Token(ValidToken.MULTI_LINE_COMMENT, comment);
	}

	private punctuator() {
		const nextChar = this.peek();

		if ((regex.signedInteger.test(this.currentChar) || regex.dot.test(this.currentChar)) && regex.decimalDigit.test(nextChar))
			return new Token(ValidToken.NUMERIC_LITERAL, this.decimalDigitsSep());

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

		throw new Error('Invalid punctuator');
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
				string += this.escapeSequence();

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
			throw new Error('Unterminated string literal');
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
			sequence += this.unicodeSequence();
		}

		return sequence;
	}

	private unicodeSequence() {
		let uSequence = this.currentChar;
		this.advance();

		if (this.currentChar !== '{') {
			throw new Error('Hexadecimal digit expected');
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
			throw new Error('Hexadecimal digit expected');
		}

		if (this.currentChar !== '}') {
			throw new Error('Unterminated unicode sequence');
		}

		const parsedValue = Number.parseInt(unicodeValue, 16);
		if (parsedValue < 0 || parsedValue > this.MAX_UNICODE_ESCAPE_VALUE) {
			throw new Error('An extended Unicode escape value must be between 0x00 and 0x10FFFF inclusive.');
		}

		uSequence += this.currentChar;

		return uSequence;
	}
}
