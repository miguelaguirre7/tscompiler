/* eslint-disable jest/expect-expect, @typescript-eslint/quotes */
import Lexer from '../src/lexer';
import { ValidToken } from '../src/token';

const lexer = new Lexer('');

describe('Lexer', () => {
	describe('Literals', () => {
		describe('Numeric Literal', () => {
			it('Recognizes single digits', () => {
				expectNumericLiteral(lexer, '5', ValidToken.NUMERIC_LITERAL, '5');
			});

			it('Recognizes multiple digits', () => {
				expectNumericLiteral(lexer, '5774230547', ValidToken.NUMERIC_LITERAL, '5774230547');
			});

			it('Recognizes multiple digits with separators', () => {
				expectNumericLiteral(lexer, '57_742_305_47', ValidToken.NUMERIC_LITERAL, '57_742_305_47');
			});

			it('Does not allow separator at the end', () => {
				expectLexerToThrow(lexer, '5243237_');
			});

			it('Allows number 0', () => {
				expectNumericLiteral(lexer, '0', ValidToken.NUMERIC_LITERAL, '0');
			});

			it('Does not allow a number literal that starts with 0', () => {
				expectLexerToThrow(lexer, '053742357');
			});

			it('Recognizes a number with a trailing decimal point', () => {
				expectNumericLiteral(lexer, '7461.', ValidToken.NUMERIC_LITERAL, '7461.');
			});

			it('Recognizes a number with no whole part', () => {
				expectNumericLiteral(lexer, '.7542309', ValidToken.NUMERIC_LITERAL, '.7542309');
			});

			it('Recognizes a number with whole part', () => {
				expectNumericLiteral(lexer, '75342.43452', ValidToken.NUMERIC_LITERAL, '75342.43452');
			});

			it('Recognizes numbers with separators', () => {
				expectNumericLiteral(lexer, '75_5342.57_5743_53', ValidToken.NUMERIC_LITERAL, '75_5342.57_5743_53');
			});

			it('Does not allow separators at the end of the integral part', () => {
				expectLexerToThrow(lexer, '5742_.75432');
			});

			it('Does not allow separators at the end of the fractional part', () => {
				expectLexerToThrow(lexer, '5742.75432_');
			});

			it('Does not allow separators at the beginning of the fractional part', () => {
				expectLexerToThrow(lexer, '5742._75432');
			});

			it('Recognizes multiple numbers', () => {
				lexer.reset('5421 1952 46_544_321 45.412 76_5342.2');

				const token1 = lexer.nextToken();
				const token2 = lexer.nextToken();
				const token3 = lexer.nextToken();
				const token4 = lexer.nextToken();
				const token5 = lexer.nextToken();

				expect(token1.type).toMatch(ValidToken.NUMERIC_LITERAL);
				expect(token1.value).toMatch('5421');
				expect(token2.type).toMatch(ValidToken.NUMERIC_LITERAL);
				expect(token2.value).toMatch('1952');
				expect(token3.type).toMatch(ValidToken.NUMERIC_LITERAL);
				expect(token3.value).toMatch('46_544_321');
				expect(token4.type).toMatch(ValidToken.NUMERIC_LITERAL);
				expect(token4.value).toMatch('45.412');
				expect(token5.type).toMatch(ValidToken.NUMERIC_LITERAL);
				expect(token5.value).toMatch('76_5342.2');
			});

			describe('Signed Integers', () => {
				describe('Positive', () => {
					it('Recognizes positive signed integers', () => {
						expectNumericLiteral(lexer, '+1934', ValidToken.NUMERIC_LITERAL, '+1934');
					});

					it('Recognizes positive signed integers with separators', () => {
						expectNumericLiteral(lexer, '+19_345_412', ValidToken.NUMERIC_LITERAL, '+19_345_412');
					});

					it('Does not allow separators at the end of a positive signed integer', () => {
						expectLexerToThrow(lexer, '+1124_');
					});

					it('Does not separators at the beginning of a positive signed integer', () => {
						expectLexerToThrow(lexer, '+_1124');
					});
				});

				describe('Negative', () => {
					it('Recognizes negative signed integers', () => {
						expectNumericLiteral(lexer, '-19345', ValidToken.NUMERIC_LITERAL, '-19345');
					});

					it('Recognizes negative signed integers with separators', () => {
						expectNumericLiteral(lexer, '-19_345_412', ValidToken.NUMERIC_LITERAL, '-19_345_412');
					});

					it('Does not allow separators at the end of a negative signed integer', () => {
						expectLexerToThrow(lexer, '-1124_');
					});

					it('Does not separators at the beginning of a negative signed integer', () => {
						expectLexerToThrow(lexer, '-_1124');
					});
				});
			});
		});

		describe('String Literals', () => {
			it('Recognizes double quote strings', () => {
				lexer.reset('"This is a simple alphabetic string"');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.STRING_LITERAL);
				expect(token.value).toMatch('"This is a simple alphabetic string"');
			});

			it('Recognizes single quote strings', () => {
				lexer.reset("'This is a simple alphabetic string'");

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.STRING_LITERAL);
				expect(token.value).toMatch("'This is a simple alphabetic string'");
			});

			it('Recognizes empty strings', () => {
				lexer.reset("''");

				let token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.STRING_LITERAL);
				expect(token.value).toMatch("''");

				lexer.reset('""');

				token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.STRING_LITERAL);
				expect(token.value).toMatch('""');
			});

			it('Throws an error with an incomplete string', () => {
				lexer.reset("'aoeu' aoeun'");

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.STRING_LITERAL);
				expect(token.value).toMatch("'aoeu'");

				expect(() => lexer.nextToken()).toThrow();
			});

			it('Throws an error with invalid characters', () => {
				lexer.reset("'aoeu\\'");

				expect(() => lexer.nextToken()).toThrowError('Unterminated string literal');
			});

			it('Recognizes character escape sequences', () => {
				lexer.reset("'This \\\"is\\\" \v a \f \\'string\\' \n with \r new \n lines \b and a \t tab'");

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.STRING_LITERAL);
				expect(token.value).toMatch("'This \\\"is\\\" \v a \f \\'string\\' \n with \r new \n lines \b and a \t tab'");
			});

			describe('Unicode Sequence', () => {
				it('Recognizes unicode sequences', () => {
					lexer.reset('"String with a \\u{0056}nicode character"');

					const token = lexer.nextToken();

					expect(token.type).toMatch(ValidToken.STRING_LITERAL);
					expect(token.value).toMatch('"String with a \\u{0056}nicode character"');
				});

				it('Throws an error with incomplete unicode sequence', () => {
					lexer.reset('"String with a \\unicode character"');

					expect(() => lexer.nextToken()).toThrowError('Hexadecimal digit expected');
				});

				it('Throws an error with unclosed brackets in an unicode sequence', () => {
					lexer.reset('"String with a \\u{anicode character"');

					expect(() => lexer.nextToken()).toThrowError('Unterminated unicode sequence');
				});
			});
		});

		describe('Boolean', () => {
			it('Recognizes boolean values', () => {
				lexer.input = '  true false ';
				lexer.reset();

				const trueToken = lexer.nextToken();
				const falseToken = lexer.nextToken();

				expect(trueToken.type).toMatch(ValidToken.BOOLEAN);
				expect(trueToken.value).toMatch('true');
				expect(falseToken.type).toMatch(ValidToken.BOOLEAN);
				expect(falseToken.value).toMatch('false');
			});
		});
	});
});

const expectNumericLiteral = (lexer: Lexer, input: string, expectedTokenType: ValidToken, expectedTokenValue: string) => {
	lexer.reset(input);

	const token = lexer.nextToken();

	expect(token.type).toMatch(expectedTokenType);
	expect(token.value).toMatch(expectedTokenValue);
};

const expectLexerToThrow = (lexer: Lexer, input: string) => {
	lexer.reset(input);
	expect(() => lexer.nextToken()).toThrow();
};
