import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const set_movement_mode_to_linear = defineGerberCommand({
  command_code: "G01",
  schema: z
    .object({
      command_code: z.literal("G01").default("G01"),
    })
    .describe(
      "Set movement mode to linear: Sets linear/circular mode to linear."
    ),
  stringify() {
    return `G01*`
  },
})
