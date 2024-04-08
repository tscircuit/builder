import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const create_arc = defineGerberCommand({
  command_code: "G75",
  schema: z
    .object({
      command_code: z.literal("G75").default("G75"),
      arc_parameters: z.string(),
    })
    .describe(
      "Create arc: A G75 must be called before creating the first arc."
    ),
  stringify() {
    return ""
  },
})

export type CreateArc = z.infer<typeof create_arc.schema>
