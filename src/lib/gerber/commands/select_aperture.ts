import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const select_aperture = defineGerberCommand({
  command_code: "D",
  schema: z.object({
    command_code: z.literal("D").default("D"),
    aperture_number: z.number().int(),
  }),
  stringify({ aperture_number }) {
    return `D${aperture_number}*`
  },
})
