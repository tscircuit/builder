import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const delete_attribute = defineGerberCommand({
  command_code: "TD",
  schema: z
    .object({
      command_code: z.literal("TD"),
      attribute: z.string(),
    })
    .describe(
      "Delete attribute: Attribute delete Delete one or all attributes in the dictionary."
    ),
  stringify() {
    return ""
  },
})
