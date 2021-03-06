import type { Token, Tokenize } from './tokenizer'
import type { Pure, SetProperty } from './utils'

type TakeToken<Tokens extends Token[]> = Tokens extends [infer FirstToken extends Token, ...infer RestTokens extends Token[]]
  ? [FirstToken, RestTokens]
  : never

type ParsePair<Tokens extends Token[]> = ParseString<Tokens> extends [infer Value extends string, infer NextTokens extends Token[]] ? (
  TakeToken<NextTokens> extends [infer NextFirstToken extends Token, infer NextRestTokens extends Token[]] ? (
    NextFirstToken['type'] extends 'SEP_COLON'
    ? ParseLiteral<NextRestTokens> extends [infer A, infer B] ? [[Value, A], B]
    : never
    : never
  ) : never
) : never


type ParseRecordImpl<Tokens extends Token[], TargetRecord = {}> = ParsePair<Tokens> extends never
  ? never
  : TakeToken<ParsePair<Tokens>[1]> extends never
  ? never
  : TakeToken<ParsePair<Tokens>[1]>[0]['type'] extends 'END_OBJECT'
  ? [SetProperty<TargetRecord, ParsePair<Tokens>[0][0], ParsePair<Tokens>[0][1]>, TakeToken<ParsePair<Tokens>[1]>[1]]
  : TakeToken<ParsePair<Tokens>[1]>[0]['type'] extends 'SEP_COMMA'
  ? ParseRecordImpl<
    TakeToken<ParsePair<Tokens>[1]>[1],
    SetProperty<TargetRecord, ParsePair<Tokens>[0][0], ParsePair<Tokens>[0][1]>
  >
  : never

type ParseRecord<Tokens extends Token[]> = Tokens extends [infer FirstToken extends Token, ...infer RestTokens extends Token[]]
  ? FirstToken['type'] extends 'END_OBJECT' ? [{}, RestTokens] : ParseRecordImpl<Tokens>
  : never

type ParseArrayImpl<Tokens extends Token[], TargetArray extends unknown[] = []> = ParseLiteral<Tokens> extends never
  ? never
  : TakeToken<ParseLiteral<Tokens>[1]> extends never
  ? never
  : TakeToken<ParseLiteral<Tokens>[1]>[0]['type'] extends 'SEP_COMMA'
  ? ParseArrayImpl<TakeToken<ParseLiteral<Tokens>[1]>[1], [...TargetArray, ParseLiteral<Tokens>[0]]>
  : TakeToken<ParseLiteral<Tokens>[1]>[0]['type'] extends 'END_ARRAY'
  ? [[...TargetArray, ParseLiteral<Tokens>[0]], TakeToken<ParseLiteral<Tokens>[1]>[1]]
  : never

type ParseArray<Tokens extends Token[]> = Tokens extends [infer FirstToken extends Token, ...infer RestTokens extends Token[]]
  ? FirstToken['type'] extends 'END_ARRAY'
  ? [[], RestTokens]
  : ParseArrayImpl<Tokens>
  : never

type ParseString<Tokens extends Token[]> = TakeToken<Tokens> extends [infer FirstToken extends Token, infer RestTokens extends Token[]]
  ? FirstToken['type'] extends "STRING"
  ? [Exclude<FirstToken['value'], undefined>, RestTokens]
  : never
  : never

type ParseKeyword<Tokens extends Token[]> = TakeToken<Tokens> extends never
  ? never
  : TakeToken<Tokens>[0]['type'] extends 'NULL' | 'BOOLEAN'
  ? Exclude<TakeToken<Tokens>[0]['value'], undefined> extends 'true'
  ? [true, TakeToken<Tokens>[1]]
  : Exclude<TakeToken<Tokens>[0]['value'], undefined> extends 'false'
  ? [false, TakeToken<Tokens>[1]]
  : Exclude<TakeToken<Tokens>[0]['value'], undefined> extends 'null'
  ? [null, TakeToken<Tokens>[1]]
  : never
  : never

type ParseRoot<Tokens extends Token[]> = TakeToken<Tokens> extends never
  ? never
  : TakeToken<Tokens>[0]['type'] extends 'BEGIN_OBJECT'
  ? ParseRecord<TakeToken<Tokens>[1]>
  : TakeToken<Tokens>[0]['type'] extends 'BEGIN_ARRAY'
  ? ParseArray<TakeToken<Tokens>[1]>
  : never

type ParseLiteral<Tokens extends Token[]> = ParseRoot<Tokens> | ParseString<Tokens> | ParseKeyword<Tokens>

export type Parse<String extends string> = Pure<ParseLiteral<Tokenize<String>>[0]>
