import { z } from "zod"

export const set_unit = z
  .object({
    command_code: z.literal("MO"),
    unit: z.enum(["mm", "in"]),
  })
  .describe("Mode: Sets the unit to mm or inch. 4.2.1")
export type SetUnit = z.infer<typeof set_unit>
