import { z } from "zod"
import { defineExcellonDrillCommand } from "../define-excellon-drill-command"

export const FMAT = defineExcellonDrillCommand({
  command_code: "FMAT",
  schema: z.object({
    command_code: z.literal("FMAT").default("FMAT"),
    format: z.number(),
  }),
  stringify: (c) => `FMAT,${c.format}`,
})
