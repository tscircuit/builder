import { AnyZodObject, z, ZodObject, ZodUnion } from "zod"

export interface GerberCommandDef<
  K extends string,
  T extends AnyZodObject | z.ZodIntersection<any, any>
> {
  command_code: K
  schema: T
  stringify: (c: z.infer<T>) => string
}

export const defineGerberCommand = <
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
}): GerberCommandDef<K, T> => {
  return {
    command_code,
    schema,
    stringify,
  }
}
