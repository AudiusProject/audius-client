// https://github.com/microsoft/TypeScript/pull/29955#issuecomment-470062531
export function removeNullable<T>(
  value: T
): value is Exclude<T, false | null | undefined | '' | 0> {
  return Boolean(value)
}

export type NestedNonNullable<T> = {
  [P in keyof T]: NestedNonNullable<NonNullable<T[P]>>
}

export type Nullable<T> = T | null
export type DeepNullable<T> = {
  [K in keyof T]: DeepNullable<T[K]> | null
}
export type Overwrite<T, U extends keyof T, V> = Omit<T, U> & V
export type Maybe<T> = T | undefined

/**
 *
 * `Brand` allows you to 'specialize' a type to introduce
 * nominal typing to TS.
 *
 * Example:
 * ```
 * type USD = Brand<number, 'USD'>
 * const balance = 3 as USD
 * ```
 *
 */
export type Brand<T, U extends string> = T & { _brand: U }
