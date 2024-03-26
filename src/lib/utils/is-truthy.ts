export const isTruthy = <T>(value: T): value is NonNullable<T> => Boolean(value)
