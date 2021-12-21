import { Token, ValidToken } from '../token';
import regex from '../util/regex';
import operators from './punctuators';
import reservedWords from './reserved_words';

export default class Lexer {
	private _input: string;
	private currentChar: string;
	private currentIndex: number;

	constructor(input: string) {
		this._input = input;
		this.currentIndex = 0;
		this.currentChar = this._input[this.currentIndex];
	}

	get input() {
		return this._input;
	}

	set input(newInput: string) {
		this._input = newInput;
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
			} else if (regex.operators.test(this.currentChar)) {
				return this.punctuator();
			} else if (regex.numericLiteral.test(this.currentChar)) {
				return new Token(ValidToken.NUMERIC_LITERAL, this.numericLiteral());
			} else if (regex.string.test(this.currentChar)) {
				return new Token(ValidToken.STRING_LITERAL, this.string());
			} else if (regex.identifierStart.test(this.currentChar)) {
				return this.word();
			} else switch (this.currentChar) {
				case '{': {
					return new Token(ValidToken.OPEN_CURLY_BRACE);
				}

				case '}': {
					return new Token(ValidToken.CLOSE_CURLY_BRACE);
				}

				case '(': {
					return new Token(ValidToken.OPEN_PAREN);
				}

				case ')': {
					return new Token(ValidToken.CLOSE_PAREN);
				}

				case '[': {
					return new Token(ValidToken.OPEN_BRACKET);
				}

				case ']': {
					return new Token(ValidToken.CLOSE_BRACKET);
				}

				case ';': {
					return new Token(ValidToken.SEMICOLON);
				}

				case ':': {
					return new Token(ValidToken.COLON);
				}

				case ',': {
					return new Token(ValidToken.COMMA);
				}

				default: {
					throw new SyntaxError('Invalid token');
				}
			}
		}

		return new Token(ValidToken.EOF);
	}

	private advance() {
		this.currentChar = this._input[++this.currentIndex];
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

	private punctuator() {
		const nextChar = this.peek();

		if ((regex.signedInteger.test(this.currentChar) || regex.dot.test(this.currentChar)) && regex.decimalDigit.test(nextChar))
			return new Token(ValidToken.NUMERIC_LITERAL, this.decimalDigitsSep());
		if (regex.numericLiteralSeparator.test(nextChar)) return this.word();

		let punctuator = '';
		while (this.currentChar !== undefined && !regex.decimalDigit.test(this.currentChar) && !regex.word.test(this.currentChar) && !regex.ws.test(this.currentChar)) {
			punctuator += this.currentChar;
			this.advance();
		}

		const operatorToken = operators.get(punctuator as Punctuator);

		if (operatorToken === undefined) {
			throw new Error('Invalid operator');
		}

		return operatorToken();
	}

	private word() {
		let word = this.currentChar;
		this.advance();

		while (this.currentChar && regex.identifierPart.test(this.currentChar)) {
			word += this.currentChar;
			this.advance();
		}

		const token = reservedWords.always.get(word as ReservedWord);

		if (token === undefined) {
			throw new Error('Invalid Token');
		}

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

		while (regex.hexDigit.test(this.currentChar)) {
			uSequence += this.currentChar;
			this.advance();
		}

		if (this.currentChar === '{') {
			throw new Error('Hexadecimal digit expected');
		}

		if (this.currentChar !== '}') {
			throw new Error('Unterminated unicode sequence');
		}

		uSequence += this.currentChar;

		return uSequence;
	}
}
