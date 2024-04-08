import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const set_movement_mode_to_counterclockwise_circular =
  defineGerberCommand({
    command_code: "G03", // Add the missing command_code property
    schema: z
      .object({
        command_code: z.literal("G03"),
      })
      .describe(
        "Set movement mode to counterclockwise circular: Sets linear/circular mode to counterclockwise circular."
      ),
    stringify() {
      return `G03*`
    },
  })
