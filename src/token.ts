export enum ValidToken {
  DECIMAL_LITERAL = "DECIMAL_DIGIT",
  EOF = "EOF",
  DOT = "DOT",
  PLUS = "PLUS",
  MINUS = "MINUS",
  BOOLEAN = "BOOLEAN",
  STRING_LITERAL = "STRING_LITERAL",
}

export default class Token {
  private _type: ValidToken;
  private _value: string | null;

  constructor(type: ValidToken, value: string | null) {
    this._type = type;
    this._value = value;
  }

  get type() {
    return this._type;
  }

  get value() {
    return this._value;
  }

  toString() {
    console.log(`${this._type} : ${this._value}`);
  }
}
