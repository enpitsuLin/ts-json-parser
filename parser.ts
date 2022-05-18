import type { TokenTypes } from './basic'
import type { SplitArrayChildren, SplitObjectProperties } from './type-util'

interface Object<Children extends any[]> {
  type: 'object'
  children: Children
}

interface Array<Children extends any[]> {
  type: 'array'
  children: Children
}

interface Property<Key, Value> {
  type: 'Property'
  key: Identifier<Key>
  value: Literal<Value>
}

interface Identifier<Value> {
  type: 'Identifier'
  value: Value
}

interface Literal<Value> {
  type: 'Literal'
  value: Value
}

type ParserObject<Input extends [...any]> = Input extends [TokenTypes['BEGIN_OBJECT'], ...infer Children, infer End]
  ? End extends TokenTypes['END_OBJECT']
    ? Children['length'] extends 0
      ? Object<[]>
      : Object<ParserProperty<SplitObjectProperties<Children>>>
    : 'Unexpected end of JSON object'
  : 'Unexpected a JSON input object'

type ParserProperty<Input, Result extends [...any] = []> = Input extends [infer Key, infer Value, ...infer Rest]
  ? Value extends [...any]
    ? ParserProperty<Rest, [Property<Key, Parser<Value>>]>
    : ParserProperty<Rest, [...Result, Property<Key, Value>]>
  : Result

type ParserList<Input extends [...any]> = Input extends [infer First, ...infer Next]
  ? First extends string
    ? [Literal<First>, ...ParserList<Next>]
    : First extends any[]
    ? [Parser<First>, ...ParserList<Next>]
    : 'Error'
  : []

type ParserArrayChildren<Input extends [...any]> = ParserList<SplitArrayChildren<Input>>

type ParserArray<Input extends [...any]> = Input extends [TokenTypes['BEGIN_ARRAY'], ...infer Children, infer End]
  ? End extends TokenTypes['END_ARRAY']
    ? Children['length'] extends 0
      ? Array<[]>
      : Array<ParserArrayChildren<Children>>
    : 'Unexpected end of JSON array'
  : 'Unexpected a JSON input array'

export type Parser<Tokens extends [...any]> = Tokens extends [infer First, ...infer Next]
  ? First extends TokenTypes['BEGIN_OBJECT']
    ? ParserObject<Tokens>
    : First extends TokenTypes['BEGIN_ARRAY']
    ? ParserArray<Tokens>
    : First extends TokenTypes['NULL']
    ? Literal<null>
    : Literal<First>
  : []
