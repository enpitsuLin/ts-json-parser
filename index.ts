import type { Equal, Expect } from '@type-challenges/utils'
import type { Parser } from './parser'
import type { Tokenize } from './tokenizer'

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

type _Test_Array = Parser<['[', 'null', ',', '{', 'foo', ':', 'bar', '}', ']']>
type _Test_Object = Parser<['{', 'foo', ':', 'null', ',', 'bar', ':', '[', 'true', ',', 'false', ',', '2', ']', '}']>

type ParserTest = Parser<Tokenize<'{"foo":"null","bar":["true","false","2"]}'>>

type cases = [
  Expect<
    Equal<
      Tokenize<'{"foo":"null","bar":["true","false","2"]}'>,
      ['{', 'foo', ':', 'null', ',', 'bar', ':', '[', 'true', ',', 'false', ',', '2', ']', '}']
    >
  >
]

export {}
