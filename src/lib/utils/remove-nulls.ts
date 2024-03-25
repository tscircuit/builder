export const removeNulls = <T>(
  obj: T
): {
  [K in keyof T]: NonNullable<T[K]>
} => _.omitBy(obj as any, _.isNil) as any
