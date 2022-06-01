import { Alpha } from './utils'

//prettier-ignore
type TokenType = 'BEGIN_OBJECT' | 'END_OBJECT' | 'BEGIN_ARRAY' | 'END_ARRAY' | 'NULL' | 'NUMBER' | 'STRING' | 'BOOLEAN' | 'SEP_COLON' | 'SEP_COMMA'

export interface Token {
  type: TokenType
  value?: string
}

type TakeString<
  Input extends string,
  String extends string = ''
  > = Input extends `${infer FirstChar}${infer RestString}`
  ? FirstChar extends '\\'
  ? RestString extends `${infer SecondChar}${infer RestChars}`
  ? TakeString<RestChars, `${String}${SecondChar}`>
  : never
  : FirstChar extends '"'
  ? [{ type: 'STRING'; value: String }, RestString]
  : FirstChar extends '\n'
  ? never
  : TakeString<RestString, `${String}${FirstChar}`>
  : never

type TakeKeyword<T, String extends string = ''> = T extends `${infer FirstChar}${infer RestString}`
  ? FirstChar extends Alpha
  ? TakeKeyword<RestString, `${String}${FirstChar}`>
  : String extends ''
  ? never
  : String extends 'true' | 'false'
  ? [{ type: 'BOOLEAN'; value: String }, T]
  : [{ type: 'NULL'; value: String }, T]
  : String extends ''
  ? never
  : String extends 'true' | 'false'
  ? [{ type: 'BOOLEAN'; value: String }, T]
  : [{ type: 'NULL'; value: String }, T]

export type Tokenize<T extends string, S extends Token[] = []> = T extends `${infer FirstChar}${infer RestString}`
  ? FirstChar extends '\r' | '\t' | ' ' | '\n'
  ? Tokenize<RestString, S>
  : FirstChar extends '{'
  ? Tokenize<RestString, [...S, { type: 'BEGIN_OBJECT' }]>
  : FirstChar extends '}'
  ? Tokenize<RestString, [...S, { type: 'END_OBJECT' }]>
  : FirstChar extends '['
  ? Tokenize<RestString, [...S, { type: 'BEGIN_ARRAY' }]>
  : FirstChar extends ']'
  ? Tokenize<RestString, [...S, { type: 'END_ARRAY' }]>
  : FirstChar extends ','
  ? Tokenize<RestString, [...S, { type: 'SEP_COMMA' }]>
  : FirstChar extends ':'
  ? Tokenize<RestString, [...S, { type: 'SEP_COLON' }]>
  : FirstChar extends '"'
  ? TakeString<RestString> extends [Token, string]
  ? Tokenize<TakeString<RestString>[1], [...S, TakeString<RestString>[0]]>
  : never
  : FirstChar extends Alpha
  ? TakeKeyword<T> extends [Token, string]
  ? Tokenize<TakeKeyword<T>[1], [...S, TakeKeyword<T>[0]]>
  : never
  : never // FirstChar cant be parsed, maybe a number
  : S
