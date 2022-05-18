import type { TokenTypes } from './basic'
import type { SplitArrayChildren } from './type-util'

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

type ParserList<Input extends [...any]> = Input extends [infer First, ...infer Next]
  ? First extends string
    ? [{ type: 'Literal'; value: First }, ...ParserList<Next>]
    : First extends any[]
    ? [Parser<First>, ...ParserList<Next>]
    : 'Error'
  : []

type ParserArrayChildren<Input extends [...any]> = ParserList<SplitArrayChildren<Input>>

type ParserArray<Input extends [...any]> = Input extends [TokenTypes['BEGIN_ARRAY'], ...infer Children, infer End]
  ? End extends TokenTypes['END_ARRAY']
    ? Children['length'] extends 0
      ? { type: 'Array'; children: [] }
      : { type: 'Array'; children: ParserArrayChildren<Children> }
    : 'Unexpected end of JSON array'
  : 'Unexpected a JSON input array'

export type Parser<Tokens extends [...any]> = Tokens extends [infer First, ...infer Next]
  ? First extends TokenTypes['BEGIN_OBJECT']
    ? ParserObject<Tokens>
    : First extends TokenTypes['BEGIN_ARRAY']
    ? ParserArray<Tokens>
    : First extends TokenTypes['NULL']
    ? { type: 'Literal'; value: null }
    : { type: 'Literal'; value: First }
  : []
