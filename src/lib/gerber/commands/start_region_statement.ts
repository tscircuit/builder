import { z } from "zod"

export const start_region_statement = z
  .object({
    command_code: z.literal("G36"),
    statement: z.string(),
  })
  .describe(
    "Start region statement: Starts a region statement which creates a region by defining its contours."
  )

export type StartRegionStatement = z.infer<typeof start_region_statement>
