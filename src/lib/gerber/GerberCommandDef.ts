import { z, ZodObject } from "zod"

export interface GerberCommandDef<T extends ZodObject<any>> {
  schema: T
  stringify: (c: T) => string
}

export const defineGerberCommand = <T extends ZodObject<any>>({
  schema,
  stringify,
}: {
  schema: T
  stringify: (c: z.infer<T>) => string
}) => {
  return { schema, stringify }
}
