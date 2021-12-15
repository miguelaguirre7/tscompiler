import { ValidToken, Token } from './token';

const reservedWords: Map<ReservedWord, () => Token> = new Map([
	['if', () => new Token(ValidToken.IF)],
	['for', () => new Token(ValidToken.FOR)],
	['const', () => new Token(ValidToken.CONST)],
	['let', () => new Token(ValidToken.LET)],
	['null', () => new Token(ValidToken.NULL_LITERAL)],
	['true', () => new Token(ValidToken.BOOLEAN, 'true')],
	['false', () => new Token(ValidToken.BOOLEAN, 'false')],
	['else', () => new Token(ValidToken.ELSE)],
	['function', () => new Token(ValidToken.FUNCTION)],
	['return', () => new Token(ValidToken.RETURN)],
	['var', () => new Token(ValidToken.VAR)],
	['while', () => new Token(ValidToken.WHILE)],
	['interface', () => new Token(ValidToken.INTERFACE)],
	['new', () => new Token(ValidToken.NEW)],
	['in', () => new Token(ValidToken.IN)],
	['break', () => new Token(ValidToken.BREAK)],
	['continue', () => new Token(ValidToken.CONTINUE)],
	['switch', () => new Token(ValidToken.SWITCH)],
	['void', () => new Token(ValidToken.VOID)],
	['case', () => new Token(ValidToken.CASE)],
	['undefined', () => new Token(ValidToken.UNDEFINED)],
]);

export default reservedWords;
