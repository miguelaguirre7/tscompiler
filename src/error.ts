import chalk from 'chalk';

export type ErrorCodes = keyof typeof errors;

export const enum Errors {
	Unexpected_Token = 1,
	Unsupported_punctuator = 900,
	Unterminated_string_literal = 1002,
	Unterminated_comment = 1010,
	Octal_literals_not_supported = 1121,
	Hexadecimal_digit_expected = 1125,
	Unicode_value_out_of_range = 1198,
	Unterminated_unicode_escape_sequence = 1199,
	Numeric_separator_not_allowed = 6188,
	Multiple_numeric_separators_not_allowed = 6189,
}

export const errors = {
	1: 'Unexpected token',
	900: 'Unsupported punctuator',
	1002: 'Unterminated string literal.',
	1010: '\'*/\' expected.',
	1121: 'Octal literals are not supported',
	1125: 'Hexadecimal digit expected.',
	1198: 'An extended Unicode escape value must be between 0x0 and 0x10FFFF inclusive.',
	1199: 'Unterminated Unicode escape sequence',
	6188: 'Numeric separators are not allowed here.',
	6189: 'Multiple consecutive numeric separators are not permitted.',
};

const logError = (filename: string, code: ErrorCodes, line: number) => {
	if (process.env.NODE_ENV === 'test') return;

	const logFilename = chalk.hex('#8BBA7F');

	console.error(`${logFilename(filename)}:${chalk.yellow(line)} - ${chalk.red('error')} ${chalk.gray('TS' + code.toString() + ':')} ${errors[code]}`);
};

export default logError;
