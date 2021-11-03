import Lexer from "../src/lexer";
import { ValidToken } from "../src/token";

let lexer = new Lexer("");

describe("Lexer", () => {
  describe("Number", () => {
    describe("Integer", () => {
      it("Recognizes single digits", () => {
        lexer.input = "5";
        lexer.reset();

        const token = lexer.nextToken();
        expect(token.type).toMatch(ValidToken.DECIMAL_LITERAL);
        expect(token.value).toMatch("5");
      });

      it("Recognizes multiple digits", () => {
        lexer.input = "5774230547";
        lexer.reset();

        const token = lexer.nextToken();
        expect(token.type).toMatch(ValidToken.DECIMAL_LITERAL);
        expect(token.value).toMatch("5774230547");
      });

      it("Recognizes multiple digits with separators", () => {
        lexer.input = "57_742_305_47";
        lexer.reset();

        const token = lexer.nextToken();
        expect(token.type).toMatch(ValidToken.DECIMAL_LITERAL);
        expect(token.value).toMatch("57_742_305_47");
      });

      it("does not allow separator at the end", () => {
        lexer.input = "5243237_";
        lexer.reset();

        expect(() => lexer.nextToken()).toThrowError(
          "Numeric separators are not allowed at the end of numeric literals"
        );
      });

      it("Allows number 0, but not a number that starts with 0", () => {
        lexer.input = "0";
        lexer.reset();

        let token = lexer.nextToken();

        expect(token.type).toMatch(ValidToken.DECIMAL_LITERAL);
        expect(token.value).toMatch("0");

        lexer.input = "053742357";
        lexer.reset();

        expect(() => lexer.nextToken()).toThrowError();
      });
    });

    describe("Floating point", () => {
      it("Recognizes a number with a trailing decimal point", () => {
        lexer.input = "7461.";
        lexer.reset();

        const token = lexer.nextToken();

        expect(token.type).toMatch(ValidToken.DECIMAL_LITERAL);
        expect(token.value).toMatch("7461.");
      });

      it("Recognizes a number with no whole part", () => {
        lexer.input = ".7542309";
        lexer.reset();

        const token = lexer.nextToken();

        expect(token.type).toMatch(ValidToken.DECIMAL_LITERAL);
        expect(token.value).toMatch(".7542309");
      });

      it("Recognizes a number with whole part", () => {
        lexer.input = "75342.43452";
        lexer.reset();

        const token = lexer.nextToken();

        expect(token.type).toMatch(ValidToken.DECIMAL_LITERAL);
        expect(token.value).toMatch("75342.43452");
      });

      it("Recognizes numbers with separators", () => {
        lexer.input = "75_5342.57_5743_53";
        lexer.reset();

        const token = lexer.nextToken();

        expect(token.type).toMatch(ValidToken.DECIMAL_LITERAL);
        expect(token.value).toMatch("75_5342.57_5743_53");
      });

      it("Does not allow separators at the end of either the whole or decimal part", () => {
        lexer.input = "5742_.75432";
        lexer.reset();

        expect(() => lexer.nextToken()).toThrowError();

        lexer.input = "5742.75432_";
        lexer.reset();

        expect(() => lexer.nextToken()).toThrowError();

        lexer.input = "5742._75432";
        lexer.reset();

        expect(() => lexer.nextToken()).toThrowError();
      });
    });
  });

  describe("String", () => {
    it("Recognizes double quote strings", () => {
      lexer.input = '"This is a simple alphabetic string"';
      lexer.reset();

      const token = lexer.nextToken();

      expect(token.type).toMatch(ValidToken.STRING_LITERAL);
      expect(token.value).toMatch('"This is a simple alphabetic string"');
    });

    it("Recognizes single quote strings", () => {
      lexer.input = "'This is a simple alphabetic string'";
      lexer.reset();

      const token = lexer.nextToken();

      expect(token.type).toMatch(ValidToken.STRING_LITERAL);
      expect(token.value).toMatch("'This is a simple alphabetic string'");
    });

    it("Recognizes empty strings", () => {
      lexer.input = "''";
      lexer.reset();

      let token = lexer.nextToken();

      expect(token.type).toMatch(ValidToken.STRING_LITERAL);
      expect(token.value).toMatch("''");

      lexer.input = '""';
      lexer.reset();

      token = lexer.nextToken();

      expect(token.type).toMatch(ValidToken.STRING_LITERAL);
      expect(token.value).toMatch('""');
    });

    it("Throws an error with an incomplete string", () => {
      lexer.input = "'aoeu' aoeun'";
      lexer.reset();

      const token = lexer.nextToken();

      expect(token.type).toMatch(ValidToken.STRING_LITERAL);
      expect(token.value).toMatch("'aoeu'");

      expect(() => lexer.nextToken()).toThrow();
    });

    it("Throws an error with invalid characters", () => {
      lexer.input = "'aoeu\\'";
      lexer.reset();

      expect(() => lexer.nextToken()).toThrow();
    });
  });

  describe("Boolean", () => {
    it("Recognizes boolean values", () => {
      lexer.input = "  true false ";
      lexer.reset();

      const trueToken = lexer.nextToken();
      const falseToken = lexer.nextToken();

      expect(trueToken.type).toMatch(ValidToken.BOOLEAN);
      expect(trueToken.value).toMatch("true");
      expect(falseToken.type).toMatch(ValidToken.BOOLEAN);
      expect(falseToken.value).toMatch("false");
    });
  });
});
