import { z } from "zod"

// https://github.com/colinhacks/zod/discussions/1953
export function getZodSchemaDefaults<Schema extends z.AnyZodObject>(
  schema: Schema
) {
  return Object.fromEntries(
    Object.entries(schema.shape)
      .map(([key, value]) => {
        if (value instanceof z.ZodDefault)
          return [key, value._def.defaultValue()]
        return [key, undefined]
      })
      .filter(([key, value]) => value !== undefined)
  )
}
