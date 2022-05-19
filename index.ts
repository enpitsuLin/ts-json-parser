import type { Parser } from './parser'
import type { Tokenize } from './tokenizer'

type ParserTest = Parser<Tokenize<'{"foo":"null","bar":["true","false","2"]}'>>
