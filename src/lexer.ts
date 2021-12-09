import Token, { ValidToken } from './token';
import regex from './util/regex';
import * as helpers from './util/helpers';

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

	reset(newInput?: string) {
		if (newInput) {
			this._input = newInput;
		}

		this.currentIndex = 0;
		this.currentChar = this._input[0];
	}

	nextToken(): Token {
		while (this.currentChar) {
			if (regex.ws.test(this.currentChar)) {
				this.advance();
				continue;
			} else if (regex.numericLiteral.test(this.currentChar)) {
				return new Token(ValidToken.NUMERIC_LITERAL, this.numericLiteral());
			} else if (regex.signedInteger.test(this.currentChar)) {
				return new Token(ValidToken.NUMERIC_LITERAL, this.signedInteger());
			} else if (regex.string.test(this.currentChar)) {
				return new Token(ValidToken.STRING_LITERAL, this.string());
			} else if (/[a-zA-Z]/.test(this.currentChar)) {
				return this.word();
			} else {
				throw new SyntaxError('Invalid token');
			}
		}

		return new Token(ValidToken.EOF, null);
	}

	private advance() {
		this.currentChar = this._input[++this.currentIndex];
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

	private signedInteger() {
		let integer = this.currentChar;
		integer += this.decimalDigitsSep();
		return integer;
	}

	private word() {
		let token = '';

		while (this.currentChar && /[a-zA-Z]/.test(this.currentChar)) {
			token += this.currentChar;
			this.advance();
		}

		if (token === 'true' || token === 'false') {
			return new Token(ValidToken.BOOLEAN, token);
		}

		throw new Error('Invalid token');
	}

	private string() {
		let string = this.currentChar;
		const stringCharacterRegex = this.currentChar === '"' ? regex.doubleStringCharacter : regex.singleStringCharacter;

		this.advance();
		while (this.currentChar !== undefined && (regex.singleEscapeFormattingCharacters.test(this.currentChar) || stringCharacterRegex.test(this.currentChar))) {
			string += regex.escapeSequence.test(this.currentChar) ? this.escapeSequence() : this.currentChar;

			if (helpers.isStringComplete(string)) break;

			this.advance();
		}

		if (!helpers.isStringValid(string)) {
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
