import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const end_of_file = defineGerberCommand({
  command_code: "M02",
  schema: z
    .object({
      command_code: z.literal("M02").default("M02"),
    })
    .describe("End of file: 4.13"),
  stringify() {
    return "M02*"
  },
})
