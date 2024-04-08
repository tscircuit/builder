import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const aperture_block = defineGerberCommand({
  command_code: "AB",
  schema: z
    .object({
      command_code: z.literal("AB").default("AB"),
      block: z.string(),
    })
    .describe(
      "Aperture block: Opens a block aperture statement and assigns its aperture number or closes a block aperture statement"
    ),
  stringify() {
    return ""
  },
})

export type ApertureBlock = z.infer<typeof aperture_block.schema>
