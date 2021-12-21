type ReservedWord = 'await' | 'catch' | 'class' | 'default' | 'do' | 'if' | 'for' | 'const' | 'let' | 'null'
| 'true' | 'false' | 'else' | 'function' | 'return' | 'var' | 'while' | 'interface' | 'new' | 'in' | 'break'
| 'continue' | 'switch' | 'case' | 'finally' | 'import' | 'enum' | 'null' | 'super' | 'this' | 'throw'
| 'try' | 'typeof' | 'instanceof' | 'yield' | 'delete' | 'extends' | 'void' | 'interface'
| 'protected' | 'private' | 'public' | 'static' | 'implements' | 'package';

type ContextualKeywords = 'of' | 'get' | 'set' | 'any' | 'declare' | 'require' | 'string' |
'number' | 'symbol' | 'object' | 'boolean' | 'from' | 'constructor' | 'module' | 'type';

type DivPunctuator = '/' | '/=';

type OptionalChainingPunctuator = '?.';

type RightBracePunctuator = '}';

type Punctuator = '{' | '(' | ')' | '[' | ']' | '.' | '...' | ';' | ',' | '<' | '>' | '<=' | '>='
| '==' | '===' | '!=' | '!==' | '+' | '-' | '*' | '%' | '**' | '++' | '--' | '!' | '<<' | '>>' | '>>>'
| '&' | '|' | '^' | '~' | '??' | '?' | '&&' | '||' | ':' | '=' | '!' | '+=' | '-=' | '*='
| '%=' | '**=' | '<<=' | '>>=' | '>>>=' | '&=' | '|=' | '^=' | '&&=' | '||=' | '??=' | '=>'
| DivPunctuator | OptionalChainingPunctuator | RightBracePunctuator;
