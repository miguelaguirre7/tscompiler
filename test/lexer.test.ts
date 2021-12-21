/* eslint-disable jest/expect-expect, @typescript-eslint/quotes */
import { Lexer } from '../src/lexer';
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
		});

		// Describe('Contextual keywords', () => {
		// 	it('of', () => {
		// 		lexer.reset('of');

		// 		const token = lexer.nextToken();

		// 		expect(token.type).toMatch(ValidToken.OF);
		// 	});

		// 	it('get', () => {
		// 		lexer.reset('get');

		// 		const token = lexer.nextToken();

		// 		expect(token.type).toMatch(ValidToken.GET);
		// 	});

		// 	it('set', () => {
		// 		lexer.reset('set');

		// 		const token = lexer.nextToken();

		// 		expect(token.type).toMatch(ValidToken.SET);
		// 	});

		// 	it('any', () => {
		// 		lexer.reset('any');

		// 		const token = lexer.nextToken();

		// 		expect(token.type).toMatch(ValidToken.TYPE);
		// 		expect(token.value).toMatch('any');
		// 	});

		// 	it('string', () => {
		// 		lexer.reset('string');

		// 		const token = lexer.nextToken();

		// 		expect(token.type).toMatch(ValidToken.TYPE);
		// 		expect(token.value).toMatch('string');
		// 	});
		// 	it('number', () => {
		// 		lexer.reset('number');

		// 		const token = lexer.nextToken();

		// 		expect(token.type).toMatch(ValidToken.TYPE);
		// 		expect(token.value).toMatch('number');
		// 	});

		// 	it('boolean', () => {
		// 		lexer.reset('boolean');

		// 		const token = lexer.nextToken();

		// 		expect(token.type).toMatch(ValidToken.TYPE);
		// 		expect(token.value).toMatch('boolean');
		// 	});

		// 	it('symbol', () => {
		// 		lexer.reset('symbol');

		// 		const token = lexer.nextToken();

		// 		expect(token.type).toMatch(ValidToken.TYPE);
		// 		expect(token.value).toMatch('symbol');
		// 	});

		// 	it('declare', () => {
		// 		lexer.reset('declare');

		// 		const token = lexer.nextToken();

		// 		expect(token.type).toMatch(ValidToken.DECLARE);
		// 	});

		// 	it('require', () => {
		// 		lexer.reset('require');

		// 		const token = lexer.nextToken();

		// 		expect(token.type).toMatch(ValidToken.REQUIRE);
		// 	});

		// 	it('from', () => {
		// 		lexer.reset('from');

		// 		const token = lexer.nextToken();

		// 		expect(token.type).toMatch(ValidToken.FROM);
		// 	});

		// 	it('constructor', () => {
		// 		lexer.reset('constructor');

		// 		const token = lexer.nextToken();

		// 		expect(token.type).toMatch(ValidToken.CONSTRUCTOR);
		// 	});

		// 	it('module', () => {
		// 		lexer.reset('module');

		// 		const token = lexer.nextToken();

		// 		expect(token.type).toMatch(ValidToken.MODULE);
		// 	});

		// 	it('type', () => {
		// 		lexer.reset('type');

		// 		const token = lexer.nextToken();

		// 		expect(token.type).toMatch(ValidToken.TYPE);
		// 	});
		// });

		it('Throws error with unsupported reserved word', () => {
			lexer.reset('async');

			expect(() => lexer.nextToken()).toThrowError('Invalid Token');
		});
	});

	describe('Operators', () => {
		it('{', () => {
			lexer.reset('{');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.OPEN_CURLY_BRACE);
		});

		it('}', () => {
			lexer.reset('}');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.CLOSE_CURLY_BRACE);
		});

		it('(', () => {
			lexer.reset('(');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.OPEN_PAREN);
		});

		it(')', () => {
			lexer.reset(')');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.CLOSE_PAREN);
		});

		it('[', () => {
			lexer.reset('[');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.OPEN_BRACKET);
		});

		it(']', () => {
			lexer.reset(']');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.CLOSE_BRACKET);
		});

		it('.', () => {
			lexer.reset('.');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.DOT);
		});

		it('...', () => {
			lexer.reset('...');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.SPREAD);
		});

		it(';', () => {
			lexer.reset(';');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.SEMICOLON);
		});

		it(':', () => {
			lexer.reset(':');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COLON);
		});

		it(',', () => {
			lexer.reset(',');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.COMMA);
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
		});

		it('-', () => {
			lexer.reset('-');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.MINUS);
		});

		it('*', () => {
			lexer.reset('*');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.MULTIPLICATION);
		});

		it('%', () => {
			lexer.reset('%');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.MODULO);
		});

		it('**', () => {
			lexer.reset('**');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.EXPONENTIATION);
		});

		it('++', () => {
			lexer.reset('++');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.INCREMENT);
		});

		it('--', () => {
			lexer.reset('--');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.DECREMENT);
		});

		it('!', () => {
			lexer.reset('!');

			const token = lexer.nextToken();

			expect(token.type).toMatch(ValidToken.NEGATION);
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
