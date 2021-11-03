import Token, { ValidToken } from "./token";

export default class Lexer {
  private _input: string;
  private currentChar: string;
  private currentIndex: number;

  constructor(input: string) {
    this._input = input;
    this.currentIndex = 0;
    this.currentChar = this._input[this.currentIndex];
  }

  set input(newInput: string) {
    this._input = newInput;
  }

  nextToken() {
    while (this.currentChar) {
      if (this.currentChar.match(/\s/)) {
        this.advance();
        continue;
      } else if (this.currentChar.match(/[\d\.]/)) {
        return new Token(ValidToken.DECIMAL_LITERAL, this.decimalLiteral());
      } else if (this.currentChar.match(/["']/)) {
        return this.string();
      } else if (this.currentChar.match(/[a-zA-Z]/)) {
        return this.word();
      } else {
        throw new SyntaxError("Invalid token");
      }
    }

    return new Token(ValidToken.EOF, null);
  }

  private advance() {
    this.currentChar = this._input[++this.currentIndex];
  }

  private word() {
    let token = "";

    while (this.currentChar && this.currentChar.match(/[a-zA-Z]/)) {
      token += this.currentChar;
      this.advance();
    }

    if (token === "true" || token === "false") {
      return new Token(ValidToken.BOOLEAN, token);
    }

    throw new Error("Invalid token");
  }

  private string() {
    let strToken = "";
    const validStringRegex = /^("[^"]*[^\\]"|""|''|'[^']*[^\\]')$/;

    while (this.currentChar && !strToken.match(validStringRegex)) {
      strToken += this.currentChar;
      this.advance();
    }

    if (!validStringRegex.test(strToken))
      throw new SyntaxError("Invalid token");

    return new Token(ValidToken.STRING_LITERAL, strToken);
  }

  private decimalDigits() {
    let digits = "";

    while (this.currentChar && this.currentChar.match(/[\d_]/)) {
      digits += this.currentChar;
      this.advance();
    }

    if (digits[digits.length - 1] === "_")
      throw new SyntaxError(
        "Numeric separators are not allowed at the end of numeric literals"
      );

    return digits;
  }

  private decimalLiteral() {
    let number = this.decimalIntegerLiteral();

    if (this.currentChar === ".") {
      number += this.currentChar;
      this.advance();
      if (!this.isNum(this.currentChar)) {
        if (number.length === 0 || (this.currentChar as string) === "_")
          throw new SyntaxError("Unexpected token");

        return number;
      }

      number += this.decimalDigits();
    }

    return number;
  }

  private decimalIntegerLiteral() {
    let int = "";

    while (this.currentChar && this.currentChar.match(/[\d_]/)) {
      int += this.currentChar;
      this.advance();
    }

    if (int.match(/^0\d+$/)) throw new SyntaxError("Invalid token");

    if (int[int.length - 1] === "_")
      throw new SyntaxError(
        "Numeric separators are not allowed at the end of numeric literals"
      );

    return int;
  }

  reset(newInput?: string) {
    if (newInput) this._input = newInput;

    this.currentIndex = 0;
    this.currentChar = this._input[0];
  }

  private isNum(str: string) {
    return /\d/.test(str);
  }
}
