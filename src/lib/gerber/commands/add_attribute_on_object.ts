import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const add_attribute_on_object = defineGerberCommand({
  command_code: "TO",
  schema: z
    .object({
      command_code: z.literal("TO").default("TO"),
      attribute_name: z.string(),
      attribute_value: z.string(),
    })
    .describe(
      "Add attribute on object: Add an object attribute to the dictionary or modify it."
    ),
  stringify: ({ attribute_name, attribute_value }) => {
    return `%TO${attribute_name},${attribute_value}*%`
  },
})

export type AddAttributeOnObject = z.infer<
  typeof add_attribute_on_object.schema
>
