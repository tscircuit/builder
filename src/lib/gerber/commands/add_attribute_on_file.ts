import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const add_attribute_on_file = defineGerberCommand({
  command_code: "TF",
  schema: z
    .object({
      command_code: z.literal("TF").default("TF"),
      attribute_name: z.string(),
      attribute_value: z.string(),
    })
    .describe("Add attribute on file: Set a file attribute."),
  stringify: ({ attribute_name, attribute_value }) => {
    return `%TF.${attribute_name},${attribute_value}*%`
  },
})
