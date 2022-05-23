import type { Expect, Equal } from '@type-challenges/utils'
import type { Tokenize } from './tokenizer'
import type { Parse } from './parser'

type Tokens = Tokenize<'{"identifier":null,"array":[true,false,"string"]}'>

type Result = Parse<'{"identifier":null,"array":[true,false,"string"]}'>

type ExpectTokens = [
  { type: 'BEGIN_OBJECT' },
  { type: 'STRING'; value: 'identifier' },
  { type: 'SEP_COLON' },
  { type: 'NULL'; value: 'null' },
  { type: 'SEP_COMMA' },
  { type: 'STRING'; value: 'array' },
  { type: 'SEP_COLON' },
  { type: 'BEGIN_ARRAY' },
  { type: 'BOOLEAN'; value: 'true' },
  { type: 'SEP_COMMA' },
  { type: 'BOOLEAN'; value: 'false' },
  { type: 'SEP_COMMA' },
  { type: 'STRING'; value: 'string' },
  { type: 'END_ARRAY' },
  { type: 'END_OBJECT' }
]

type cases = [Expect<Equal<Tokens, ExpectTokens>>]
