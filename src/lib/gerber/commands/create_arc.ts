import { z } from "zod"

export const create_arc = z
  .object({
    command_code: z.literal("G75"),
    arc_parameters: z.string(),
  })
  .describe("Create arc: A G75 must be called before creating the first arc.")

export type CreateArc = z.infer<typeof create_arc>
