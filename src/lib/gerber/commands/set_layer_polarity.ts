import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const set_layer_polarity = defineGerberCommand({
  command_code: "LP",
  schema: z
    .object({
      command_code: z.literal("LP").default("LP"),
      polarity: z.enum(["D", "C"]),
    })
    .describe(
      "Layer Polarity: Sets the layer polarity to dark or clear. 4.2.1"
    ),
  stringify({ polarity }) {
    return `%LP${polarity}*%`
  },
})
