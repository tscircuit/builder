import { z } from "zod"

export const end_of_file = z
  .object({
    command_code: z.literal("M02"),
    statement: z.string(),
  })
  .describe("End of file: 4.13")

export type EndOfFile = z.infer<typeof end_of_file>
