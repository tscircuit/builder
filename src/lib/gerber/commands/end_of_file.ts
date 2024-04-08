import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const end_of_file = defineGerberCommand({
  command_code: "M02",
  schema: z
    .object({
      command_code: z.literal("M02"),
      statement: z.string(),
    })
    .describe("End of file: 4.13"),
})

export type EndOfFile = z.infer<typeof end_of_file>
