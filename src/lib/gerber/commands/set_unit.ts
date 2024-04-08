import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const set_unit = defineGerberCommand({
  command_code: "MO",
  schema: z
    .object({
      command_code: z.literal("MO").default("MO"),
      unit: z.enum(["mm", "in"]),
    })
    .describe("Mode: Sets the unit to mm or inch. 4.2.1"),
  stringify({ unit }) {
    return `%MO${unit}*%`
  },
})
