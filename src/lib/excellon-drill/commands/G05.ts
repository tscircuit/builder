import { z } from "zod"
import { defineExcellonDrillCommand } from "../define-excellon-drill-command"

export const G05 = defineExcellonDrillCommand({
  command_code: "G05",
  schema: z.object({
    command_code: z.literal("G05").default("G05"),
  }),
  stringify: () => "G05",
})
