import type { TokenTypes, Numeric } from './basic'

/**
 * Tokenize
 * - When char is number will be **never**, a number.
 * - Parsing the numbers is technically possible, but compiler will throw Type instantiation is excessively deep.
 */
export type Tokenize<Input extends string> = Input extends `${infer F}${infer U}`
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
    : F extends ' '
    ? Tokenize<U>
    : ReadingString<`${F}${U}`>
  : []

/**
 * Get a first parsed string from S
 */
type ReadingString<String extends string> = String extends `"${infer U}"${infer Rest}` ? [U, ...Tokenize<Rest>] : never
