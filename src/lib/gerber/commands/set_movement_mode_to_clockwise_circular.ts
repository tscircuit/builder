import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const set_movement_mode_to_clockwise_circular = defineGerberCommand({
  command_code: "G02",
  schema: z
    .object({
      command_code: z.literal("G02"),
    })
    .describe(
      "Set movement mode to clockwise circular: Sets linear/circular mode to clockwise circular."
    ),
  stringify() {
    return `G02*`
  },
})
