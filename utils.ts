export type Alpha =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z'

export type Pure<T> = T extends object
  ? {
      [P in keyof T]: Pure<T[P]>
    }
  : T

export type SetProperty<T, K extends PropertyKey, V> = {
  [P in keyof T | K]: P extends K ? V : P extends keyof T ? T[P] : never
}
