import type { Token, Tokenize } from './tokenizer'
import type { Pure, SetProperty } from './utils'

type TakeToken<Tokens extends Token[]> = Tokens extends [infer FirstToken, ...infer RestTokens]
  ? [FirstToken, RestTokens] extends [Token, Token[]]
    ? [FirstToken, RestTokens]
    : never
  : never

type ParsePair<Tokens extends Token[]> = ParseString<Tokens> extends never
  ? ParseString<Tokens>
  : TakeToken<ParseString<Tokens>[1]> extends never
  ? never
  : TakeToken<ParseString<Tokens>[1]>[0]['type'] extends 'SEP_COLON'
  ? ParseLiteral<TakeToken<ParseString<Tokens>[1]>[1]> extends never
    ? never
    : [
        [ParseString<Tokens>[0], ParseLiteral<TakeToken<ParseString<Tokens>[1]>[1]>[0]],
        ParseLiteral<TakeToken<ParseString<Tokens>[1]>[1]>[1]
      ]
  : never

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

type ParseRecord<Tokens extends Token[]> = Tokens extends [infer FirstToken, ...infer RestTokens]
  ? FirstToken extends Token
    ? RestTokens extends Token[]
      ? FirstToken['type'] extends 'END_OBJECT'
        ? [{}, RestTokens]
        : ParseRecordImpl<Tokens>
      : never
    : never
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

type ParseArray<Tokens extends Token[]> = Tokens extends [infer FirstToken, ...infer RestTokens]
  ? [FirstToken, RestTokens] extends [Token, Token[]]
    ? [FirstToken, RestTokens][0]['type'] extends 'END_ARRAY'
      ? [[], RestTokens]
      : ParseArrayImpl<Tokens>
    : never
  : never

type ParseString<Tokens extends Token[]> = TakeToken<Tokens> extends never
  ? never
  : TakeToken<Tokens>[0]['type'] extends 'STRING'
  ? [Exclude<TakeToken<Tokens>[0]['value'], undefined>, TakeToken<Tokens>[1]]
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
