import type { TokenTypes } from './basic'

type _SplitComma<Input extends [...any], Result extends [...any] = []> = Input extends [infer First, ...infer Next]
  ? First extends TokenTypes['BEGIN_OBJECT'] | TokenTypes['BEGIN_ARRAY']
    ? [...Result, ..._SplitComma<Next, [First]>]
    : First extends TokenTypes['END_ARRAY'] | TokenTypes['END_OBJECT']
    ? [[...Result, First], ..._SplitComma<Next, []>]
    : _SplitComma<Next, [...Result, First]>
  : Result

type _RemoveComma<Input extends [...any]> = Input extends [infer First, ',', ...infer Next]
  ? [First, _RemoveComma<Next>]
  : Input

export type SplitArrayChildren<Input extends [...any]> = _SplitComma<_RemoveComma<Input>>
