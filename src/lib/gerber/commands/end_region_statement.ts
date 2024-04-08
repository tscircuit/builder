import { z } from "zod"

export const end_region_statement = z
  .object({
    command_code: z.literal("G37"),
    statement: z.string(),
  })
  .describe("End region statement: Ends the region statement")

export type EndRegionStatement = z.infer<typeof end_region_statement>
