import regex from './regex';

export const isStringValid = (string: string) => /^["'].*(?<!\\)["']$/s.test(string);

export const isStringComplete = (string: string) => string.startsWith(string[string.length - 1]) && regex.string.test(string[0]) && string[string.length - 2] !== '\\';
