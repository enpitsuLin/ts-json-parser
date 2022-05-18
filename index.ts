import type { Equal, Expect } from '@type-challenges/utils'
import type { TokenTypes } from './basic'
import { SplitArrayChildren } from './type-util'

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
type ReadingString<String extends string> = String extends `"${infer U}"${infer Rest}` ? [U, ...Tokenize<Rest>] : never

type ParserObject<Input extends [...any]> = Input extends [TokenTypes['BEGIN_OBJECT'], ...infer Children, infer End]
  ? End extends TokenTypes['END_OBJECT']
    ? Children['length'] extends 0
      ? { type: 'Object'; children: [] }
      : { type: 'Object'; children: [ParserProperty<Children>] }
    : 'Unexpected end of JSON object'
  : 'Unexpected a JSON input object'

type ParserProperty<Input extends [...any]> = Input extends [
  TokenTypes['STRING'],
  TokenTypes['SEP_COLON'],
  ...infer Value
]
  ? {
      type: 'Property'
      key: {
        type: 'Identifier'
        value: Input[0]
      }
      value: Parser<Value>
    }
  : never

type ParserArray<Input extends [...any]> = Input extends [TokenTypes['BEGIN_ARRAY'], ...infer Children, infer End]
  ? End extends TokenTypes['END_ARRAY']
    ? Children['length'] extends 0
      ? { type: 'Array'; children: [] }
      : { type: 'Array'; children: Children }
    : 'Unexpected end of JSON array'
  : 'Unexpected a JSON input array'

type Parser<Tokens extends [...any]> = Tokens extends [infer First, ...infer Next]
  ? First extends TokenTypes['BEGIN_OBJECT']
    ? ParserObject<Tokens>
    : First extends TokenTypes['BEGIN_ARRAY']
    ? ParserArray<Tokens>
    : First extends TokenTypes['NULL']
    ? { type: 'Literal'; value: null }
    : { type: 'Literal'; value: First }
  : []

type _Test_Array = Parser<['[', 'null', ',', '{', 'foo', ':', 'bar', '}', ']']>
type _Test_Object = Parser<['{', 'foo', ':', '[', 'null', ',', '123', ']', '}']>

type cases = [
  Expect<
    Equal<
      Tokenize<'{"foo":"null","bar":["true","false","2"]}'>,
      ['{', 'foo', ':', 'null', ',', 'bar', ':', '[', 'true', ',', 'false', ',', '2', ']', '}']
    >
  >
]

export {}
