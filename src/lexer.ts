import Token, { ValidToken } from "./token";

export default class Lexer {
  private input: string;
  private currentChar: string;
  private currentIndex: number;

  constructor(input: string) {
    this.input = input;
    this.currentIndex = 0;
    this.currentChar = this.input[this.currentIndex];
  }

  getNextToken() {
    while (this.currentChar) {
      if (this.currentChar.match(/\s/)) {
        this.advance();
        continue;
      } else if (this.currentChar.match(/[\d\.]/)) {
        return new Token(ValidToken.DECIMAL_DIGIT, this.decimalLiteral());
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
    this.currentChar = this.input[++this.currentIndex];
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

    while (!strToken.match(/("[^"]*[^\\]"|'[^']*[^\\]')/)) {
      strToken += this.currentChar;
      this.advance();
      if (this.currentChar === undefined)
        throw new SyntaxError("Invalid token");
    }

    return new Token(ValidToken.STRING_LITERAL, strToken);
  }

  private decimalLiteral() {
    let number = this.decimalIntegerLiteral();

    if (number.indexOf(".") !== -1) {
      let literals = number.split(".");
      if (literals.length !== 2) throw new SyntaxError("Unexpected number");

      if (literals[0] === "") return "." + literals[1];
      if (literals[1] === "") return literals[0];

      const validNumLiteral = /^[\d_]+\d?$/;

      for (let i = 0; i < literals.length; i++) {
        if (literals[i].endsWith("_"))
          throw new SyntaxError(
            "Numeric separators are not allowed at the end of numeric literals"
          );
        if (!literals[i].match(validNumLiteral)) {
          throw new SyntaxError("Invalid or unexpected token");
        }

        literals[i] = literals[i].replace(/_/g, "");
      }

      return literals.join(".");
    }

    return number.replace(/_/g, "");
  }

  private decimalIntegerLiteral() {
    let int = "";
    while (this.currentChar && this.currentChar.match(/[\d_\.]/)) {
      int += this.currentChar;
      this.advance();
    }

    return int;
  }
}
