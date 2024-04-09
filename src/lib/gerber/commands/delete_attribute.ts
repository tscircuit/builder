import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const delete_attribute = defineGerberCommand({
  command_code: "TD",
  schema: z
    .object({
      command_code: z.literal("TD").default("TD"),
      attribute: z.string().optional(),
    })
    .describe(
      "Delete attribute: Attribute delete Delete one or all attributes in the dictionary."
    ),
  stringify({ attribute }) {
    if (!attribute) {
      return `%TD*%`
    }
    return `%TD${attribute}*%`
  },
})
