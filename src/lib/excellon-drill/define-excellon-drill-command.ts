import { AnyZodObject, z } from "zod"

export interface ExcellonDrillCommandDef<
  K extends string,
  T extends AnyZodObject | z.ZodIntersection<any, any>
> {
  command_code: K
  schema: T
  stringify: (c: z.infer<T>) => string
}

export const defineExcellonDrillCommand = <
  K extends string,
  T extends AnyZodObject | z.ZodIntersection<any, any>
>({
  command_code,
  schema,
  stringify,
}: {
  command_code: K
  schema: T
  stringify: (c: z.infer<T>) => string
}): ExcellonDrillCommandDef<K, T> => {
  return {
    command_code,
    schema,
    stringify,
  }
}
