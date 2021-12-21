/* eslint-disable no-control-regex */
const regex = {
	ws: /\s/,
	numericLiteral: /[\d.]/,
	dot: /\./,
	operators: /[/+*%=!?&|~><.^-]/,
	signedInteger: /[+-]/,
	decimalDigit: /\d/,
	nonZeroDigit: /[1-9]/,
	numericLiteralSeparator: /_/,
	string: /["']/,
	escapeSequence: /\\/,
	unicodeEscapeSequence: /u/,
	singleEscapeCharacter: /['"\\\b\n\t\v\f\r]/,
	singleEscapeFormattingCharacters: /[\b\n\t\v\f\r]/,
	singleEscapeNonFormattingCharacters: /['"\\]/,
	nonEscapeCharacter: /[^'"\\\b\f\n\r\t\v\u000A\u000D\u2028\u2029u]/,
	doubleStringCharacter: /[^\u000A\u000D\u2028\u2029]/,
	singleStringCharacter: /[^\u000A\u000D\u2028\u2029]/,
	hexDigit: /[\dA-F]/,
	word: /[a-zA-Z]/,
	identifierStart: /[a-zA-Z$_]/,
	identifierPart: /[a-zA-Z$\d]/,
};

export default regex;
