import { z } from "zod"
import { defineExcellonDrillCommand } from "../define-excellon-drill-command"

export const G90 = defineExcellonDrillCommand({
  command_code: "G90",
  schema: z.object({
    command_code: z.literal("G90").default("G90"),
  }),
  stringify: () => "G90",
})
