import type { Equal, Expect } from '@type-challenges/utils'

type Numeric = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

type TokenType =
  | 'BEGIN_OBJECT'
  | 'END_OBJECT'
  | 'BEGIN_ARRAY'
  | 'END_ARRAY'
  | 'NULL'
  | 'NUMBER'
  | 'STRING'
  | 'BOOLEAN'
  | 'SEP_COLON'
  | 'SEP_COMMA'

interface TokenTypes {
  BEGIN_OBJECT: '{'
  END_OBJECT: '}'
  BEGIN_ARRAY: '['
  END_ARRAY: ']'
  SEP_COLON: ':'
  SEP_COMMA: ','
}

/**
 * Tokenize
 * - When char is number will be **never**, a number. 
 * - Parsing the numbers is technically possible, but compiler will throw Type instantiation is excessively deep.
 */
type Tokenize<Input extends string> = Input extends `${infer F}${infer U}`
  ? F extends TokenTypes['BEGIN_OBJECT']
    ? [TokenTypes['BEGIN_OBJECT'], ...Tokenize<U>]
    : F extends TokenTypes['END_OBJECT']
    ? [TokenTypes['END_OBJECT'], ...Tokenize<U>]
    : F extends TokenTypes['BEGIN_ARRAY']
    ? [TokenTypes['BEGIN_ARRAY'], ...Tokenize<U>]
    : F extends TokenTypes['END_ARRAY']
    ? [TokenTypes['END_ARRAY'], ...Tokenize<U>]
    : F extends TokenTypes['SEP_COLON']
    ? [TokenTypes['SEP_COLON'], ...Tokenize<U>]
    : F extends TokenTypes['SEP_COMMA']
    ? [TokenTypes['SEP_COMMA'], ...Tokenize<U>]
    : F extends Numeric
    ? never
    : ReadingString<`${F}${U}`>
  : []

/**
 * Get a first parsed string from S
 */
type ReadingString<String extends string> = String extends `"${infer U}"${infer Rest}`
  ? [JudgeString<U>, ...Tokenize<Rest>]
  : never

/**
 * Judge whether a string literal is boolean/null
 */
type JudgeString<S extends string> = S extends 'true' ? true : S extends 'false' ? false : S extends 'null' ? null : S

type cases = [
  Expect<
    Equal<
      Tokenize<'{"foo":"null","bar":["true","false","2"]}'>,
      ['{', 'foo', ':', null, ',', 'bar', ':', '[', true, ',', false, ',', '2', ']', '}']
    >
  >
]

export {}
