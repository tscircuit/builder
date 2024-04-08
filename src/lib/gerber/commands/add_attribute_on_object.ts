import { z } from "zod"

export const add_attribute_on_object = z
  .object({
    command_code: z.literal("TO"),
    attribute: z.string(),
  })
  .describe(
    "Add attribute on object: Add an object attribute to the dictionary or modify it."
  )

export type AddAttributeOnObject = z.infer<typeof add_attribute_on_object>
