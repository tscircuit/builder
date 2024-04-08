import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const add_attribute_on_aperture = defineGerberCommand({
  command_code: "TA",
  schema: z
    .object({
      command_code: z.literal("TA").default("TA"),
      attribute_name: z.string(),
      attribute_value: z.string(),
    })
    .describe(
      "Add attribute on aperture: Add an aperture attribute to the dictionary or modify it."
    ),
  stringify: ({ attribute_name, attribute_value }) => {
    return `%TA${attribute_name},${attribute_value}*%`
  },
})
