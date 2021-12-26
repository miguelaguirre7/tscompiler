/* eslint-disable jest/expect-expect, @typescript-eslint/quotes */
import { Lexer } from '../src/lexer';
import { Token, ValidToken } from '../src/token';

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
				lexer.reset("'string' identifier'");
				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.STRING_LITERAL);
				expect(token.value).toMatch("'string'");

				const identifier = lexer.nextToken();
				expect(identifier.type).toMatch(ValidToken.IDENTIFIER);
				expect(identifier.value).toMatch('identifier');

				expect(() => lexer.nextToken()).toThrowError('Unterminated string literal');
			});

			it('Throws an error with invalid characters', () => {
				lexer.reset("'invalid\\'");

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

				it('Throws an error when the unicode value is out of range', () => {
					lexer.reset('"String with a \\u{FFFFFF} character"');

					expect(() => lexer.nextToken()).toThrowError('An extended Unicode escape value must be between 0x00 and 0x10FFFF inclusive.');
				});
			});
		});

		it('Recognizes null literal', () => {
			lexer.reset('null');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.NULL_LITERAL);
		});

		describe('Boolean', () => {
			it('Recognizes boolean values', () => {
				lexer.reset('true false');

				const trueToken = lexer.nextToken();
				const falseToken = lexer.nextToken();

				expect(trueToken.type).toMatch(ValidToken.BOOLEAN);
				expect(trueToken.value).toMatch('true');
				expect(falseToken.type).toMatch(ValidToken.BOOLEAN);
				expect(falseToken.value).toMatch('false');
			});
		});
	});

	describe('Comments', () => {
		describe('Multi Line', () => {
			it('Recognizes multi line comments', () => {
				lexer.reset('/* This is a \t multi \n line \n comment */');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.MULTI_LINE_COMMENT);
				expect(token.value).toMatch('/* This is a \t multi \n line \n comment */');
			});

			it('Throws an error with a non-terminated comment', () => {
				lexer.reset('/* Unterminated \n comment ');

				expect(() => lexer.nextToken()).toThrowError('*/ expected.');
			});
		});

		describe('Single Line', () => {
			it('Recognizes single line comments', () => {
				lexer.reset('// This is a single line comment');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.SINGLE_LINE_COMMENT);
				expect(token.value).toMatch('// This is a single line comment');
			});

			it('Comments are terminated with a new line', () => {
				lexer.reset('// First comment\n // Second comment\n');

				const firstComment = lexer.nextToken();
				const secondComment = lexer.nextToken();

				expect(firstComment.type).toMatch(ValidToken.SINGLE_LINE_COMMENT);
				expect(firstComment.value).toMatch('// First comment');
				expect(secondComment.type).toMatch(ValidToken.SINGLE_LINE_COMMENT);
				expect(secondComment.value).toMatch('// Second comment');
			});
		});
	});

	describe('Identifiers', () => {
		it('Recognizes identifiers', () => {
			lexer.reset('variable');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.IDENTIFIER);
			expect(token.value).toMatch('variable');
		});
	});

	describe('Reserved Words', () => {
		describe('Unconditionally reserved keywords', () => {
			it('if', () => {
				lexer.reset('if');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.IF);
			});

			it('else', () => {
				lexer.reset('else');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.ELSE);
			});

			it('for', () => {
				lexer.reset('for');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.FOR);
			});

			it('while', () => {
				lexer.reset('while');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.WHILE);
			});

			it('const', () => {
				lexer.reset('const');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.CONST);
			});

			it('let', () => {
				lexer.reset('let');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.LET);
			});

			it('var', () => {
				lexer.reset('var');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.VAR);
			});

			it('function', () => {
				lexer.reset('function');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.FUNCTION);
			});

			it('continue', () => {
				lexer.reset('continue');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.CONTINUE);
			});

			it('return', () => {
				lexer.reset('return');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.RETURN);
			});

			it('interface', () => {
				lexer.reset('interface');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.INTERFACE);
			});

			it('new', () => {
				lexer.reset('new');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.NEW);
			});

			it('in', () => {
				lexer.reset('in');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.IN);
			});

			it('break', () => {
				lexer.reset('break');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.BREAK);
			});

			it('switch', () => {
				lexer.reset('switch');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.SWITCH);
			});

			it('case', () => {
				lexer.reset('case');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.CASE);
			});

			it('void', () => {
				lexer.reset('void');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.VOID);
			});

			it('await', () => {
				lexer.reset('await');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.AWAIT);
			});

			it('catch', () => {
				lexer.reset('catch');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.CATCH);
			});

			it('class', () => {
				lexer.reset('class');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.CLASS);
			});

			it('default', () => {
				lexer.reset('default');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.DEFAULT);
			});

			it('do', () => {
				lexer.reset('do');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.DO);
			});

			it('import', () => {
				lexer.reset('import');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.IMPORT);
			});

			it('export', () => {
				lexer.reset('export');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.EXPORT);
			});

			it('enum', () => {
				lexer.reset('enum');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.ENUM);
			});

			it('null', () => {
				lexer.reset('null');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.NULL_LITERAL);
			});

			it('super', () => {
				lexer.reset('super');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.SUPER);
			});

			it('this', () => {
				lexer.reset('this');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.THIS);
			});

			it('throw', () => {
				lexer.reset('throw');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.THROW);
			});

			it('try', () => {
				lexer.reset('try');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.TRY);
			});

			it('typeof', () => {
				lexer.reset('typeof');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.TYPEOF);
			});

			it('instanceof', () => {
				lexer.reset('instanceof');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.INSTANCEOF);
			});

			it('yield', () => {
				lexer.reset('yield');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.YIELD);
			});

			it('delete', () => {
				lexer.reset('delete');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.DELETE);
			});

			it('extends', () => {
				lexer.reset('extends');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.EXTENDS);
			});

			it('protected', () => {
				lexer.reset('protected');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.PROTECTED);
			});

			it('private', () => {
				lexer.reset('private');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.PRIVATE);
			});

			it('public', () => {
				lexer.reset('public');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.PUBLIC);
			});

			it('static', () => {
				lexer.reset('static');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.STATIC);
			});

			it('implements', () => {
				lexer.reset('implements');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.IMPLEMENTS);
			});

			it('package', () => {
				lexer.reset('package');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.PACKAGE);
			});

			it('as', () => {
				lexer.reset('as');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.AS);
			});
		});

		describe('Contextual keywords', () => {
			it('of', () => {
				lexer.reset('of');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.OF);
			});

			it('get', () => {
				lexer.reset('get');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.GET);
			});

			it('set', () => {
				lexer.reset('set');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.SET);
			});

			it('any', () => {
				lexer.reset('any');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.TYPE);
				expect(token.value).toMatch('any');
			});

			it('string', () => {
				lexer.reset('string');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.TYPE);
				expect(token.value).toMatch('string');
			});
			it('number', () => {
				lexer.reset('number');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.TYPE);
				expect(token.value).toMatch('number');
			});

			it('boolean', () => {
				lexer.reset('boolean');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.TYPE);
				expect(token.value).toMatch('boolean');
			});

			it('symbol', () => {
				lexer.reset('symbol');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.TYPE);
				expect(token.value).toMatch('symbol');
			});

			it('declare', () => {
				lexer.reset('declare');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.DECLARE);
			});

			it('require', () => {
				lexer.reset('require');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.REQUIRE);
			});

			it('from', () => {
				lexer.reset('from');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.FROM);
			});

			it('constructor', () => {
				lexer.reset('constructor');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.CONSTRUCTOR);
			});

			it('module', () => {
				lexer.reset('module');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.MODULE);
			});

			it('type', () => {
				lexer.reset('type');

				const token = lexer.nextToken();

				expect(token.type).toMatch(ValidToken.TYPE);
			});
		});
	});

	describe('Operators', () => {
		it('{', () => {
			lexer.reset('{');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.OPEN_CURLY_BRACE);
			expect(token.value).toMatch('{');
		});

		it('}', () => {
			lexer.reset('}');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
			expect(token.value).toMatch('}');
		});

		it('(', () => {
			lexer.reset('(');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.OPEN_PAREN);
			expect(token.value).toMatch('(');
		});

		it(')', () => {
			lexer.reset(')');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.CLOSE_PAREN);
			expect(token.value).toMatch(')');
		});

		it('[', () => {
			lexer.reset('[');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.OPEN_BRACKET);
			expect(token.value).toMatch('[');
		});

		it(']', () => {
			lexer.reset(']');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.CLOSE_BRACKET);
			expect(token.value).toMatch(']');
		});

		it('.', () => {
			lexer.reset('.');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.DOT);
			expect(token.value).toMatch('.');
		});

		it('...', () => {
			lexer.reset('...');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.SPREAD);
			expect(token.value).toMatch('...');
		});

		it(';', () => {
			lexer.reset(';');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.SEMICOLON);
			expect(token.value).toMatch(';');
		});

		it(':', () => {
			lexer.reset(':');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COLON);
			expect(token.value).toMatch(':');
		});

		it(',', () => {
			lexer.reset(',');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMMA);
			expect(token.value).toMatch(',');
		});

		it('<', () => {
			lexer.reset('<');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPARISON_OP);
			expect(token.value).toMatch('<');
		});

		it('>', () => {
			lexer.reset('>');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPARISON_OP);
			expect(token.value).toMatch('>');
		});

		it('>=', () => {
			lexer.reset('>=');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPARISON_OP);
			expect(token.value).toMatch('>=');
		});

		it('<=', () => {
			lexer.reset('<=');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPARISON_OP);
			expect(token.value).toMatch('<=');
		});

		it('==', () => {
			lexer.reset('==');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPARISON_OP);
			expect(token.value).toMatch('==');
		});

		it('===', () => {
			lexer.reset('===');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPARISON_OP);
			expect(token.value).toMatch('===');
		});

		it('!=', () => {
			lexer.reset('!=');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPARISON_OP);
			expect(token.value).toMatch('!=');
		});

		it('!==', () => {
			lexer.reset('!==');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPARISON_OP);
			expect(token.value).toMatch('!==');
		});

		it('+', () => {
			lexer.reset('+');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.PLUS);
			expect(token.value).toMatch('+');
		});

		it('-', () => {
			lexer.reset('-');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.MINUS);
			expect(token.value).toMatch('-');
		});

		it('*', () => {
			lexer.reset('*');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.MULTIPLICATION);
			expect(token.value).toMatch('*');
		});

		it('%', () => {
			lexer.reset('%');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.MODULO);
			expect(token.value).toMatch('%');
		});

		it('**', () => {
			lexer.reset('**');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.EXPONENTIATION);
			expect(token.value).toMatch('**');
		});

		it('++', () => {
			lexer.reset('++');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.INCREMENT);
			expect(token.value).toMatch('++');
		});

		it('--', () => {
			lexer.reset('--');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.DECREMENT);
			expect(token.value).toMatch('--');
		});

		it('!', () => {
			lexer.reset('!');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.NEGATION);
			expect(token.value).toMatch('!');
		});

		it('<<', () => {
			lexer.reset('<<');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.BITWISE_OP);
			expect(token.value).toMatch('<<');
		});

		it('>>', () => {
			lexer.reset('>>');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.BITWISE_OP);
			expect(token.value).toMatch('>>');
		});

		it('>>>', () => {
			lexer.reset('>>>');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.BITWISE_OP);
			expect(token.value).toMatch('>>>');
		});

		it('&', () => {
			lexer.reset('&');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.BITWISE_OP);
			expect(token.value).toMatch('&');
		});

		it('|', () => {
			lexer.reset('|');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.BITWISE_OP);
			expect(token.value).toMatch('|');
		});

		it('^', () => {
			lexer.reset('^');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.BITWISE_OP);
			expect(token.value).toMatch('^');
		});

		it('~', () => {
			lexer.reset('~');
			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.BITWISE_NOT);
			expect(token.value).toMatch('~');
		});

		it('??', () => {
			lexer.reset('??');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.NULL_COALESCING);
			expect(token.value).toMatch('??');
		});

		it('?', () => {
			lexer.reset('?');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.QUESTION_MARK);
			expect(token.value).toMatch('?');
		});

		it('&&', () => {
			lexer.reset('&&');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.LOGICAL_OP);
			expect(token.value).toMatch('&&');
		});

		it('||', () => {
			lexer.reset('||');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.LOGICAL_OP);
			expect(token.value).toMatch('||');
		});

		it('=', () => {
			lexer.reset('=');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.ASSIGNMENT);
			expect(token.value).toMatch('=');
		});

		it('+=', () => {
			lexer.reset('+=');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPOUND_ASSIGNMENT);
			expect(token.value).toMatch('+=');
		});

		it('-=', () => {
			lexer.reset('-=');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPOUND_ASSIGNMENT);
			expect(token.value).toMatch('-=');
		});

		it('*=', () => {
			lexer.reset('*=');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPOUND_ASSIGNMENT);
			expect(token.value).toMatch('*=');
		});

		it('%=', () => {
			lexer.reset('%=');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPOUND_ASSIGNMENT);
			expect(token.value).toMatch('%=');
		});

		it('**=', () => {
			lexer.reset('**=');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPOUND_ASSIGNMENT);
			expect(token.value).toMatch('**=');
		});

		it('<<=', () => {
			lexer.reset('<<=');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPOUND_ASSIGNMENT);
			expect(token.value).toMatch('<<=');
		});

		it('>>=', () => {
			lexer.reset('>>=');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPOUND_ASSIGNMENT);
			expect(token.value).toMatch('>>=');
		});

		it('>>>=', () => {
			lexer.reset('>>>=');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPOUND_ASSIGNMENT);
			expect(token.value).toMatch('>>>=');
		});

		it('&=', () => {
			lexer.reset('&=');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPOUND_ASSIGNMENT);
			expect(token.value).toMatch('&=');
		});

		it('|=', () => {
			lexer.reset('|=');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPOUND_ASSIGNMENT);
			expect(token.value).toMatch('|=');
		});

		it('^=', () => {
			lexer.reset('^=');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPOUND_ASSIGNMENT);
			expect(token.value).toMatch('^=');
		});

		it('&&=', () => {
			lexer.reset('&&=');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPOUND_ASSIGNMENT);
			expect(token.value).toMatch('&&=');
		});

		it('||=', () => {
			lexer.reset('||=');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPOUND_ASSIGNMENT);
			expect(token.value).toMatch('||=');
		});

		it('??=', () => {
			lexer.reset('??=');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPOUND_ASSIGNMENT);
			expect(token.value).toMatch('??=');
		});

		it('=>', () => {
			lexer.reset('=>');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.ARROW);
			expect(token.value).toMatch('=>');
		});

		it('?.', () => {
			lexer.reset('?.');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.OPTIONAL_CHAINING);
			expect(token.value).toMatch('?.');
		});

		it('/', () => {
			lexer.reset('/');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.DIV_PUNCTUATOR);
			expect(token.value).toMatch('/');
		});

		it('/=', () => {
			lexer.reset('/=');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMPOUND_ASSIGNMENT);
			expect(token.value).toMatch('/=');
		});
	});

	describe('Expressions and Statements', () => {
		describe('Modules', () => {
			it('Import members from module', () => {
				lexer.reset("import { member as 'alias', member2, default as Alias } from 'module'");

				const tokens = getTokens(lexer);

				expect(tokens.length).toBe(14);
				expect(tokens[0].type).toMatch(ValidToken.IMPORT);
				expect(tokens[1].type).toMatch(ValidToken.OPEN_CURLY_BRACE);
				expect(tokens[2].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[2].value).toMatch('member');
				expect(tokens[3].type).toMatch(ValidToken.AS);
				expect(tokens[4].type).toMatch(ValidToken.STRING_LITERAL);
				expect(tokens[4].value).toMatch("'alias'");
				expect(tokens[5].type).toMatch(ValidToken.COMMA);
				expect(tokens[6].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[6].value).toMatch('member2');
				expect(tokens[7].type).toMatch(ValidToken.COMMA);
				expect(tokens[8].type).toMatch(ValidToken.DEFAULT);
				expect(tokens[9].type).toMatch(ValidToken.AS);
				expect(tokens[10].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[10].value).toMatch('Alias');
				expect(tokens[11].type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
				expect(tokens[12].type).toMatch(ValidToken.FROM);
				expect(tokens[13].type).toMatch(ValidToken.STRING_LITERAL);
				expect(tokens[13].value).toMatch("'module'");
			});

			it('Import everything from module with alias', () => {
				lexer.reset("import * as Alias from 'module'");

				const tokens = getTokens(lexer);

				expect(tokens.length).toBe(6);
				expect(tokens[0].type).toMatch(ValidToken.IMPORT);
				expect(tokens[1].type).toMatch(ValidToken.MULTIPLICATION);
				expect(tokens[2].type).toMatch(ValidToken.AS);
				expect(tokens[3].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[3].value).toMatch('Alias');
				expect(tokens[4].type).toMatch(ValidToken.FROM);
				expect(tokens[5].type).toMatch(ValidToken.STRING_LITERAL);
				expect(tokens[5].value).toMatch("'module'");
			});

			it('Export statement', () => {
				lexer.reset(`
					export default fn;	
				`);

				const tokens = getTokens(lexer);

				expect(tokens.length).toBe(4);

				expect(tokens[0].type).toMatch(ValidToken.EXPORT);
			});
		});

		describe('Variable declaration', () => {
			it('let', () => {
				lexer.reset('let variable: number = 5;');

				const tokens = getTokens(lexer);

				expect(tokens.length).toBe(7);
				expect(tokens[0].type).toMatch(ValidToken.LET);
				expect(tokens[1].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[1].value).toMatch('variable');
				expect(tokens[2].type).toMatch(ValidToken.COLON);
				expect(tokens[3].type).toMatch(ValidToken.TYPE);
				expect(tokens[3].value).toMatch('number');
				expect(tokens[4].type).toMatch(ValidToken.ASSIGNMENT);
				expect(tokens[5].type).toMatch(ValidToken.NUMERIC_LITERAL);
				expect(tokens[5].value).toMatch('5');
				expect(tokens[6].type).toMatch(ValidToken.SEMICOLON);
			});

			it('const', () => {
				lexer.reset('const variable: string = "string";');

				const tokens = getTokens(lexer);

				expect(tokens.length).toBe(7);
				expect(tokens[0].type).toMatch(ValidToken.CONST);
				expect(tokens[1].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[1].value).toMatch('variable');
				expect(tokens[2].type).toMatch(ValidToken.COLON);
				expect(tokens[3].type).toMatch(ValidToken.TYPE);
				expect(tokens[3].value).toMatch('string');
				expect(tokens[4].type).toMatch(ValidToken.ASSIGNMENT);
				expect(tokens[5].type).toMatch(ValidToken.STRING_LITERAL);
				expect(tokens[5].value).toMatch('"string"');
				expect(tokens[6].type).toMatch(ValidToken.SEMICOLON);
			});

			it('var', () => {
				lexer.reset('var variable: boolean = true;');

				const tokens = getTokens(lexer);

				expect(tokens.length).toBe(7);
				expect(tokens[0].type).toMatch(ValidToken.VAR);
				expect(tokens[1].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[1].value).toMatch('variable');
				expect(tokens[2].type).toMatch(ValidToken.COLON);
				expect(tokens[3].type).toMatch(ValidToken.TYPE);
				expect(tokens[3].value).toMatch('boolean');
				expect(tokens[4].type).toMatch(ValidToken.ASSIGNMENT);
				expect(tokens[5].type).toMatch(ValidToken.BOOLEAN);
				expect(tokens[5].value).toMatch('true');
				expect(tokens[6].type).toMatch(ValidToken.SEMICOLON);
			});
		});

		describe('Iteration statements', () => {
			it('for', () => {
				lexer.reset(`
						for(let i = 0; i < 5; i++) {
							console.log(i);
						}
					`);

				const tokens = getTokens(lexer);

				expect(tokens.length).toBe(23);
				expect(tokens[0].type).toMatch(ValidToken.FOR);
				expect(tokens[1].type).toMatch(ValidToken.OPEN_PAREN);
				expect(tokens[2].type).toMatch(ValidToken.LET);
				expect(tokens[3].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[3].value).toMatch('i');
				expect(tokens[4].type).toMatch(ValidToken.ASSIGNMENT);
				expect(tokens[5].type).toMatch(ValidToken.NUMERIC_LITERAL);
				expect(tokens[5].value).toMatch('0');
				expect(tokens[6].type).toMatch(ValidToken.SEMICOLON);
				expect(tokens[7].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[7].value).toMatch('i');
				expect(tokens[8].type).toMatch(ValidToken.COMPARISON_OP);
				expect(tokens[8].value).toMatch('<');
				expect(tokens[9].type).toMatch(ValidToken.NUMERIC_LITERAL);
				expect(tokens[9].value).toMatch('5');
				expect(tokens[10].type).toMatch(ValidToken.SEMICOLON);
				expect(tokens[11].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[11].value).toMatch('i');
				expect(tokens[12].type).toMatch(ValidToken.INCREMENT);
				expect(tokens[13].type).toMatch(ValidToken.CLOSE_PAREN);
				expect(tokens[14].type).toMatch(ValidToken.OPEN_CURLY_BRACE);
				expect(tokens[15].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[15].value).toMatch('console');
				expect(tokens[16].type).toMatch(ValidToken.DOT);
				expect(tokens[17].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[17].value).toMatch('log');
				expect(tokens[18].type).toMatch(ValidToken.OPEN_PAREN);
				expect(tokens[19].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[19].value).toMatch('i');
				expect(tokens[20].type).toMatch(ValidToken.CLOSE_PAREN);
				expect(tokens[21].type).toMatch(ValidToken.SEMICOLON);
				expect(tokens[22].type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
			});

			it('while', () => {
				lexer.reset(`
						while (i >= -1_000) {
							console.log(i);
							i--;
							continue;
						}
					`);

				const tokens = getTokens(lexer);

				expect(tokens.length).toBe(20);
				expect(tokens[0].type).toMatch(ValidToken.WHILE);
				expect(tokens[1].type).toMatch(ValidToken.OPEN_PAREN);
				expect(tokens[2].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[2].value).toMatch('i');
				expect(tokens[3].type).toMatch(ValidToken.COMPARISON_OP);
				expect(tokens[3].value).toMatch('>=');
				expect(tokens[4].type).toMatch(ValidToken.NUMERIC_LITERAL);
				expect(tokens[4].value).toMatch('-1_000');
				expect(tokens[5].type).toMatch(ValidToken.CLOSE_PAREN);
				expect(tokens[6].type).toMatch(ValidToken.OPEN_CURLY_BRACE);
				expect(tokens[7].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[7].value).toMatch('console');
				expect(tokens[8].type).toMatch(ValidToken.DOT);
				expect(tokens[9].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[9].value).toMatch('log');
				expect(tokens[10].type).toMatch(ValidToken.OPEN_PAREN);
				expect(tokens[11].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[11].value).toMatch('i');
				expect(tokens[12].type).toMatch(ValidToken.CLOSE_PAREN);
				expect(tokens[13].type).toMatch(ValidToken.SEMICOLON);
				expect(tokens[14].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[14].value).toMatch('i');
				expect(tokens[15].type).toMatch(ValidToken.DECREMENT);
				expect(tokens[16].type).toMatch(ValidToken.SEMICOLON);
				expect(tokens[17].type).toMatch(ValidToken.CONTINUE);
				expect(tokens[18].type).toMatch(ValidToken.SEMICOLON);
				expect(tokens[19].type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
			});

			it('do-while', () => {
				lexer.reset(`
						do {
							a = a + 1;
							b = b - 2;
							break;
						} while (a === b && b != 10_100_000);
					`);

				const tokens = getTokens(lexer);

				expect(tokens.length).toBe(28);
				expect(tokens[0].type).toMatch(ValidToken.DO);
				expect(tokens[1].type).toMatch(ValidToken.OPEN_CURLY_BRACE);
				expect(tokens[2].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[2].value).toMatch('a');
				expect(tokens[3].type).toMatch(ValidToken.ASSIGNMENT);
				expect(tokens[4].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[4].value).toMatch('a');
				expect(tokens[5].type).toMatch(ValidToken.PLUS);
				expect(tokens[6].type).toMatch(ValidToken.NUMERIC_LITERAL);
				expect(tokens[6].value).toMatch('1');
				expect(tokens[7].type).toMatch(ValidToken.SEMICOLON);
				expect(tokens[8].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[8].value).toMatch('b');
				expect(tokens[9].type).toMatch(ValidToken.ASSIGNMENT);
				expect(tokens[10].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[10].value).toMatch('b');
				expect(tokens[11].type).toMatch(ValidToken.MINUS);
				expect(tokens[12].type).toMatch(ValidToken.NUMERIC_LITERAL);
				expect(tokens[12].value).toMatch('2');
				expect(tokens[13].type).toMatch(ValidToken.SEMICOLON);
				expect(tokens[14].type).toMatch(ValidToken.BREAK);
				expect(tokens[15].type).toMatch(ValidToken.SEMICOLON);
				expect(tokens[16].type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
				expect(tokens[17].type).toMatch(ValidToken.WHILE);
				expect(tokens[18].type).toMatch(ValidToken.OPEN_PAREN);
				expect(tokens[19].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[19].value).toMatch('a');
				expect(tokens[20].type).toMatch(ValidToken.COMPARISON_OP);
				expect(tokens[20].value).toMatch('===');
				expect(tokens[21].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[21].value).toMatch('b');
				expect(tokens[22].type).toMatch(ValidToken.LOGICAL_OP);
				expect(tokens[22].value).toMatch('&&');
				expect(tokens[23].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[23].value).toMatch('b');
				expect(tokens[24].type).toMatch(ValidToken.COMPARISON_OP);
				expect(tokens[24].value).toMatch('!=');
				expect(tokens[25].type).toMatch(ValidToken.NUMERIC_LITERAL);
				expect(tokens[25].value).toMatch('10_100_000');
				expect(tokens[26].type).toMatch(ValidToken.CLOSE_PAREN);
				expect(tokens[27].type).toMatch(ValidToken.SEMICOLON);
			});

			it('for-of', () => {
				lexer.reset(`
						for (let el of array)	{
							const variable: object = { el };
						}
					`);

				const tokens = getTokens(lexer);

				expect(tokens.length).toBe(18);
				expect(tokens[0].type).toMatch(ValidToken.FOR);
				expect(tokens[1].type).toMatch(ValidToken.OPEN_PAREN);
				expect(tokens[2].type).toMatch(ValidToken.LET);
				expect(tokens[3].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[3].value).toMatch('el');
				expect(tokens[4].type).toMatch(ValidToken.OF);
				expect(tokens[5].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[5].value).toMatch('array');
				expect(tokens[6].type).toMatch(ValidToken.CLOSE_PAREN);
				expect(tokens[7].type).toMatch(ValidToken.OPEN_CURLY_BRACE);
				expect(tokens[8].type).toMatch(ValidToken.CONST);
				expect(tokens[9].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[9].value).toMatch('variable');
				expect(tokens[10].type).toMatch(ValidToken.COLON);
				expect(tokens[11].type).toMatch(ValidToken.TYPE);
				expect(tokens[11].value).toMatch('object');
				expect(tokens[12].type).toMatch(ValidToken.ASSIGNMENT);
				expect(tokens[13].type).toMatch(ValidToken.OPEN_CURLY_BRACE);
				expect(tokens[14].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[14].value).toMatch('el');
				expect(tokens[15].type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
				expect(tokens[16].type).toMatch(ValidToken.SEMICOLON);
				expect(tokens[17].type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
			});

			it('for-in', () => {
				lexer.reset(`
						for (let el in array)	{ el + 1; }
					`);

				const tokens = getTokens(lexer);

				expect(tokens.length).toBe(13);
				expect(tokens[0].type).toMatch(ValidToken.FOR);
				expect(tokens[1].type).toMatch(ValidToken.OPEN_PAREN);
				expect(tokens[2].type).toMatch(ValidToken.LET);
				expect(tokens[3].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[3].value).toMatch('el');
				expect(tokens[4].type).toMatch(ValidToken.IN);
				expect(tokens[5].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[5].value).toMatch('array');
				expect(tokens[6].type).toMatch(ValidToken.CLOSE_PAREN);
				expect(tokens[7].type).toMatch(ValidToken.OPEN_CURLY_BRACE);
				expect(tokens[8].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[8].value).toMatch('el');
				expect(tokens[9].type).toMatch(ValidToken.PLUS);
				expect(tokens[10].type).toMatch(ValidToken.NUMERIC_LITERAL);
				expect(tokens[10].value).toMatch('1');
				expect(tokens[11].type).toMatch(ValidToken.SEMICOLON);
				expect(tokens[12].type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
			});
		});

		describe('if Statement', () => {
			it('if-else', () => {
				lexer.reset(`
						if (a >= 3)	{
							// Do nothing
						} else a += 2;
					`);

				const tokens = getTokens(lexer);

				expect(tokens.length).toBe(14);
				expect(tokens[0].type).toMatch(ValidToken.IF);
				expect(tokens[1].type).toMatch(ValidToken.OPEN_PAREN);
				expect(tokens[2].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[2].value).toMatch('a');
				expect(tokens[3].type).toMatch(ValidToken.COMPARISON_OP);
				expect(tokens[3].value).toMatch('>=');
				expect(tokens[4].type).toMatch(ValidToken.NUMERIC_LITERAL);
				expect(tokens[4].value).toMatch('3');
				expect(tokens[5].type).toMatch(ValidToken.CLOSE_PAREN);
				expect(tokens[6].type).toMatch(ValidToken.OPEN_CURLY_BRACE);
				expect(tokens[7].type).toMatch(ValidToken.SINGLE_LINE_COMMENT);
				expect(tokens[7].value).toMatch('// Do nothing');
				expect(tokens[8].type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
				expect(tokens[9].type).toMatch(ValidToken.ELSE);
				expect(tokens[10].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[10].value).toMatch('a');
				expect(tokens[11].type).toMatch(ValidToken.COMPOUND_ASSIGNMENT);
				expect(tokens[11].value).toMatch('+=');
				expect(tokens[12].type).toMatch(ValidToken.NUMERIC_LITERAL);
				expect(tokens[12].value).toMatch('2');
				expect(tokens[13].type).toMatch(ValidToken.SEMICOLON);
			});
		});

		it('switch Statement', () => {
			lexer.reset(`
					switch(a) {
						case 6:
							a **= 2;
							break;
						default:
							break;
					}
				`);

			const tokens = getTokens(lexer);

			expect(tokens.length).toBe(19);
			expect(tokens[0].type).toMatch(ValidToken.SWITCH);
			expect(tokens[1].type).toMatch(ValidToken.OPEN_PAREN);
			expect(tokens[2].type).toMatch(ValidToken.IDENTIFIER);
			expect(tokens[2].value).toMatch('a');
			expect(tokens[3].type).toMatch(ValidToken.CLOSE_PAREN);
			expect(tokens[4].type).toMatch(ValidToken.OPEN_CURLY_BRACE);
			expect(tokens[5].type).toMatch(ValidToken.CASE);
			expect(tokens[6].type).toMatch(ValidToken.NUMERIC_LITERAL);
			expect(tokens[6].value).toMatch('6');
			expect(tokens[7].type).toMatch(ValidToken.COLON);
			expect(tokens[8].type).toMatch(ValidToken.IDENTIFIER);
			expect(tokens[8].value).toMatch('a');
			expect(tokens[9].type).toMatch(ValidToken.COMPOUND_ASSIGNMENT);
			expect(tokens[9].value).toMatch('**=');
			expect(tokens[10].type).toMatch(ValidToken.NUMERIC_LITERAL);
			expect(tokens[10].value).toMatch('2');
			expect(tokens[11].type).toMatch(ValidToken.SEMICOLON);
			expect(tokens[12].type).toMatch(ValidToken.BREAK);
			expect(tokens[13].type).toMatch(ValidToken.SEMICOLON);
			expect(tokens[14].type).toMatch(ValidToken.DEFAULT);
			expect(tokens[15].type).toMatch(ValidToken.COLON);
			expect(tokens[16].type).toMatch(ValidToken.BREAK);
			expect(tokens[17].type).toMatch(ValidToken.SEMICOLON);
			expect(tokens[18].type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
		});

		it('try Statement', () => {
			lexer.reset(`
					try {
						const $var1: symbol = new Symbol();
					}	catch (e) {
						/* Nothing */
					} finally {
						close();
					}
				`);

			const tokens = getTokens(lexer);

			expect(tokens.length).toBe(27);
			expect(tokens[0].type).toMatch(ValidToken.TRY);
			expect(tokens[1].type).toMatch(ValidToken.OPEN_CURLY_BRACE);
			expect(tokens[2].type).toMatch(ValidToken.CONST);
			expect(tokens[3].type).toMatch(ValidToken.IDENTIFIER);
			expect(tokens[3].value).toMatch('$var1');
			expect(tokens[4].type).toMatch(ValidToken.COLON);
			expect(tokens[5].type).toMatch(ValidToken.TYPE);
			expect(tokens[5].value).toMatch('symbol');
			expect(tokens[6].type).toMatch(ValidToken.ASSIGNMENT);
			expect(tokens[7].type).toMatch(ValidToken.NEW);
			expect(tokens[8].type).toMatch(ValidToken.IDENTIFIER);
			expect(tokens[8].value).toMatch('Symbol');
			expect(tokens[9].type).toMatch(ValidToken.OPEN_PAREN);
			expect(tokens[10].type).toMatch(ValidToken.CLOSE_PAREN);
			expect(tokens[11].type).toMatch(ValidToken.SEMICOLON);
			expect(tokens[12].type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
			expect(tokens[13].type).toMatch(ValidToken.CATCH);
			expect(tokens[14].type).toMatch(ValidToken.OPEN_PAREN);
			expect(tokens[15].type).toMatch(ValidToken.IDENTIFIER);
			expect(tokens[15].value).toMatch('e');
			expect(tokens[16].type).toMatch(ValidToken.CLOSE_PAREN);
			expect(tokens[17].type).toMatch(ValidToken.OPEN_CURLY_BRACE);
			expect(tokens[18].type).toMatch(ValidToken.MULTI_LINE_COMMENT);
			expect(tokens[18].value).toMatch('/* Nothing */');
			expect(tokens[19].type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
			expect(tokens[20].type).toMatch(ValidToken.FINALLY);
			expect(tokens[21].type).toMatch(ValidToken.OPEN_CURLY_BRACE);
			expect(tokens[22].type).toMatch(ValidToken.IDENTIFIER);
			expect(tokens[22].value).toMatch('close');
			expect(tokens[23].type).toMatch(ValidToken.OPEN_PAREN);
			expect(tokens[24].type).toMatch(ValidToken.CLOSE_PAREN);
			expect(tokens[25].type).toMatch(ValidToken.SEMICOLON);
			expect(tokens[26].type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
		});

		it('declare Statement', () => {
			lexer.reset(`
					declare StringOrNull = string | null;
				`);

			const tokens = getTokens(lexer);

			expect(tokens.length).toBe(7);
			expect(tokens[0].type).toMatch(ValidToken.DECLARE);
			expect(tokens[1].type).toMatch(ValidToken.IDENTIFIER);
			expect(tokens[1].value).toMatch('StringOrNull');
			expect(tokens[2].type).toMatch(ValidToken.ASSIGNMENT);
			expect(tokens[3].type).toMatch(ValidToken.TYPE);
			expect(tokens[3].value).toMatch('string');
			expect(tokens[4].type).toMatch(ValidToken.BITWISE_OP);
			expect(tokens[4].value).toMatch('|');
			expect(tokens[5].type).toMatch(ValidToken.NULL_LITERAL);
			expect(tokens[6].type).toMatch(ValidToken.SEMICOLON);
		});

		it('interface Statement', () => {
			lexer.reset(`
					interface User {
						name: string;
						active: boolean;
					}
				`);

			const tokens = getTokens(lexer);

			expect(tokens.length).toBe(12);
			expect(tokens[0].type).toMatch(ValidToken.INTERFACE);
			expect(tokens[1].type).toMatch(ValidToken.IDENTIFIER);
			expect(tokens[1].value).toMatch('User');
			expect(tokens[2].type).toMatch(ValidToken.OPEN_CURLY_BRACE);
			expect(tokens[3].type).toMatch(ValidToken.IDENTIFIER);
			expect(tokens[3].value).toMatch('name');
			expect(tokens[4].type).toMatch(ValidToken.COLON);
			expect(tokens[5].type).toMatch(ValidToken.TYPE);
			expect(tokens[5].value).toMatch('string');
			expect(tokens[6].type).toMatch(ValidToken.SEMICOLON);
			expect(tokens[7].type).toMatch(ValidToken.IDENTIFIER);
			expect(tokens[7].value).toMatch('active');
			expect(tokens[8].type).toMatch(ValidToken.COLON);
			expect(tokens[9].type).toMatch(ValidToken.TYPE);
			expect(tokens[9].value).toMatch('boolean');
			expect(tokens[10].type).toMatch(ValidToken.SEMICOLON);
			expect(tokens[11].type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
		});

		describe('Functions', () => {
			it('function definition', () => {
				lexer.reset(`
					function(one: string, two: number){
						return one + two;	
					}
				`);

				const tokens = getTokens(lexer);

				expect(tokens.length).toBe(17);
				expect(tokens[0].type).toMatch(ValidToken.FUNCTION);
				expect(tokens[1].type).toMatch(ValidToken.OPEN_PAREN);
				expect(tokens[2].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[2].value).toMatch('one');
				expect(tokens[3].type).toMatch(ValidToken.COLON);
				expect(tokens[4].type).toMatch(ValidToken.TYPE);
				expect(tokens[4].value).toMatch('string');
				expect(tokens[5].type).toMatch(ValidToken.COMMA);
				expect(tokens[6].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[6].value).toMatch('two');
				expect(tokens[7].type).toMatch(ValidToken.COLON);
				expect(tokens[8].type).toMatch(ValidToken.TYPE);
				expect(tokens[8].value).toMatch('number');
				expect(tokens[9].type).toMatch(ValidToken.CLOSE_PAREN);
				expect(tokens[10].type).toMatch(ValidToken.OPEN_CURLY_BRACE);
				expect(tokens[11].type).toMatch(ValidToken.RETURN);
				expect(tokens[12].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[12].value).toMatch('one');
				expect(tokens[13].type).toMatch(ValidToken.PLUS);
				expect(tokens[14].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[14].value).toMatch('two');
				expect(tokens[15].type).toMatch(ValidToken.SEMICOLON);
				expect(tokens[16].type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
			});

			it('Arrow Function', () => {
				lexer.reset(`
						const fn = (...obj: object) = { return null; };
					`);

				const tokens = getTokens(lexer);

				expect(tokens.length).toBe(16);
				expect(tokens[0].type).toMatch(ValidToken.CONST);
				expect(tokens[1].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[1].value).toMatch('fn');
				expect(tokens[2].type).toMatch(ValidToken.ASSIGNMENT);
				expect(tokens[3].type).toMatch(ValidToken.OPEN_PAREN);
				expect(tokens[4].type).toMatch(ValidToken.SPREAD);
				expect(tokens[5].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[5].value).toMatch('obj');
				expect(tokens[6].type).toMatch(ValidToken.COLON);
				expect(tokens[7].type).toMatch(ValidToken.TYPE);
				expect(tokens[7].value).toMatch('object');
				expect(tokens[8].type).toMatch(ValidToken.CLOSE_PAREN);
				expect(tokens[9].type).toMatch(ValidToken.ASSIGNMENT);
				expect(tokens[10].type).toMatch(ValidToken.OPEN_CURLY_BRACE);
				expect(tokens[11].type).toMatch(ValidToken.RETURN);
				expect(tokens[12].type).toMatch(ValidToken.NULL_LITERAL);
				expect(tokens[13].type).toMatch(ValidToken.SEMICOLON);
				expect(tokens[14].type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
				expect(tokens[15].type).toMatch(ValidToken.SEMICOLON);
			});

			it('Methods', () => {
				lexer.reset(`
						get val1() { return null; }
						set val2() { return null; }
					`);

				const tokens = getTokens(lexer);

				expect(tokens.length).toBe(18);
				expect(tokens[0].type).toMatch(ValidToken.GET);
				expect(tokens[1].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[1].value).toMatch('val1');
				expect(tokens[2].type).toMatch(ValidToken.OPEN_PAREN);
				expect(tokens[3].type).toMatch(ValidToken.CLOSE_PAREN);
				expect(tokens[4].type).toMatch(ValidToken.OPEN_CURLY_BRACE);
				expect(tokens[5].type).toMatch(ValidToken.RETURN);
				expect(tokens[6].type).toMatch(ValidToken.NULL_LITERAL);
				expect(tokens[7].type).toMatch(ValidToken.SEMICOLON);
				expect(tokens[8].type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
				expect(tokens[9].type).toMatch(ValidToken.SET);
				expect(tokens[10].type).toMatch(ValidToken.IDENTIFIER);
				expect(tokens[10].value).toMatch('val2');
				expect(tokens[11].type).toMatch(ValidToken.OPEN_PAREN);
				expect(tokens[12].type).toMatch(ValidToken.CLOSE_PAREN);
				expect(tokens[13].type).toMatch(ValidToken.OPEN_CURLY_BRACE);
				expect(tokens[14].type).toMatch(ValidToken.RETURN);
				expect(tokens[15].type).toMatch(ValidToken.NULL_LITERAL);
				expect(tokens[16].type).toMatch(ValidToken.SEMICOLON);
				expect(tokens[17].type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
			});
		});

		it('Classes', () => {
			lexer.reset(`
					class Test implements SC {
						constructor() {
							super();
							this._a = false;
						}
					}	
				`);

			const tokens = getTokens(lexer);

			expect(tokens.length).toBe(21);
			expect(tokens[0].type).toMatch(ValidToken.CLASS);
			expect(tokens[1].type).toMatch(ValidToken.IDENTIFIER);
			expect(tokens[1].value).toMatch('Test');
			expect(tokens[2].type).toMatch(ValidToken.IMPLEMENTS);
			expect(tokens[3].type).toMatch(ValidToken.IDENTIFIER);
			expect(tokens[3].value).toMatch('SC');
			expect(tokens[4].type).toMatch(ValidToken.OPEN_CURLY_BRACE);
			expect(tokens[5].type).toMatch(ValidToken.CONSTRUCTOR);
			expect(tokens[6].type).toMatch(ValidToken.OPEN_PAREN);
			expect(tokens[7].type).toMatch(ValidToken.CLOSE_PAREN);
			expect(tokens[8].type).toMatch(ValidToken.OPEN_CURLY_BRACE);
			expect(tokens[9].type).toMatch(ValidToken.SUPER);
			expect(tokens[10].type).toMatch(ValidToken.OPEN_PAREN);
			expect(tokens[11].type).toMatch(ValidToken.CLOSE_PAREN);
			expect(tokens[12].type).toMatch(ValidToken.SEMICOLON);
			expect(tokens[13].type).toMatch(ValidToken.THIS);
			expect(tokens[14].type).toMatch(ValidToken.DOT);
			expect(tokens[15].type).toMatch(ValidToken.IDENTIFIER);
			expect(tokens[15].value).toMatch('_a');
			expect(tokens[16].type).toMatch(ValidToken.ASSIGNMENT);
			expect(tokens[17].type).toMatch(ValidToken.BOOLEAN);
			expect(tokens[17].value).toMatch('false');
			expect(tokens[18].type).toMatch(ValidToken.SEMICOLON);
			expect(tokens[19].type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
			expect(tokens[20].type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
		});
	});

	it('There is only one EOF token', () => {
		lexer.reset(`
				let var1 = 5;	
			`);

		getTokens(lexer);

		expect(lexer.nextToken()).toBe(lexer.eofToken);
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

const getTokens = (lexer: Lexer) => {
	const tokens: Token[] = [];
	let token = lexer.nextToken();

	while (token !== lexer.eofToken) {
		tokens.push(token);
		token = lexer.nextToken();
	}

	return tokens;
};
