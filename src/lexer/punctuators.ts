import { Token, ValidToken } from '../token';

const operators: Map<Punctuator, () => Token> = new Map([
	['+', () => new Token(ValidToken.PLUS, '+')],
	['-', () => new Token(ValidToken.MINUS, '-')],
	['*', () => new Token(ValidToken.MULTIPLICATION, '*')],
	['/', () => new Token(ValidToken.DIV_PUNCTUATOR, '/')],
	['++', () => new Token(ValidToken.INCREMENT, '++')],
	['--', () => new Token(ValidToken.DECREMENT, '--')],
	['**', () => new Token(ValidToken.EXPONENTIATION, '**')],
	['%', () => new Token(ValidToken.MODULO, '%')],
	['=', () => new Token(ValidToken.ASSIGNMENT, '+')],
	['+=', () => new Token(ValidToken.COMPOUND_ASSIGNMENT, '+=')],
	['-=', () => new Token(ValidToken.COMPOUND_ASSIGNMENT, '-=')],
	['*=', () => new Token(ValidToken.COMPOUND_ASSIGNMENT, '*=')],
	['/=', () => new Token(ValidToken.COMPOUND_ASSIGNMENT, '/=')],
	['%=', () => new Token(ValidToken.COMPOUND_ASSIGNMENT, '%=')],
	['<<=', () => new Token(ValidToken.COMPOUND_ASSIGNMENT, '<<=')],
	['>>=', () => new Token(ValidToken.COMPOUND_ASSIGNMENT, '>>=')],
	['>>>=', () => new Token(ValidToken.COMPOUND_ASSIGNMENT, '>>>=')],
	['**=', () => new Token(ValidToken.COMPOUND_ASSIGNMENT, '**=')],
	['&=', () => new Token(ValidToken.COMPOUND_ASSIGNMENT, '&=')],
	['|=', () => new Token(ValidToken.COMPOUND_ASSIGNMENT, '|=')],
	['^=', () => new Token(ValidToken.COMPOUND_ASSIGNMENT, '^=')],
	['&&=', () => new Token(ValidToken.COMPOUND_ASSIGNMENT, '&&=')],
	['||=', () => new Token(ValidToken.COMPOUND_ASSIGNMENT, '||=')],
	['??=', () => new Token(ValidToken.COMPOUND_ASSIGNMENT, '??=')],
	['<', () => new Token(ValidToken.COMPARISON_OP, '<')],
	['>', () => new Token(ValidToken.COMPARISON_OP, '>')],
	['<=', () => new Token(ValidToken.COMPARISON_OP, '<=')],
	['>=', () => new Token(ValidToken.COMPARISON_OP, '>=')],
	['==', () => new Token(ValidToken.COMPARISON_OP, '==')],
	['===', () => new Token(ValidToken.COMPARISON_OP, '===')],
	['!=', () => new Token(ValidToken.COMPARISON_OP, '!=')],
	['!==', () => new Token(ValidToken.COMPARISON_OP, '!==')],
	['.', () => new Token(ValidToken.DOT, '.')],
	['...', () => new Token(ValidToken.SPREAD, '...')],
	['>>', () => new Token(ValidToken.BITWISE_OP, '>>')],
	['>>>', () => new Token(ValidToken.BITWISE_OP, '>>>')],
	['<<', () => new Token(ValidToken.BITWISE_OP, '<<')],
	['&', () => new Token(ValidToken.BITWISE_OP, '&')],
	['|', () => new Token(ValidToken.BITWISE_OP, '|')],
	['^', () => new Token(ValidToken.BITWISE_OP, '^')],
	['~', () => new Token(ValidToken.BITWISE_NOT, '~')],
	['?', () => new Token(ValidToken.QUESTION_MARK, '?')],
	['??', () => new Token(ValidToken.NULL_COALESCING, '??')],
	['&&', () => new Token(ValidToken.LOGICAL_OP, '&&')],
	['||', () => new Token(ValidToken.LOGICAL_OP, '||')],
	['!', () => new Token(ValidToken.NEGATION, '!')],
	['=>', () => new Token(ValidToken.ARROW, '=>')],
	['?.', () => new Token(ValidToken.OPTIONAL_CHAINING, '?.')],
]);

export default operators;