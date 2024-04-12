import { z } from "zod"
import { defineExcellonDrillCommand } from "../define-excellon-drill-command"

export const M30 = defineExcellonDrillCommand({
  command_code: "M30",
  schema: z.object({
    command_code: z.literal("M30").default("M30"),
  }),
  stringify: () => "M30",
})
