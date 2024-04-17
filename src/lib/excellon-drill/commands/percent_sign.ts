import { z } from "zod"
import { defineExcellonDrillCommand } from "../define-excellon-drill-command"

export const percent_sign = defineExcellonDrillCommand({
  command_code: "percent_sign",
  schema: z.object({
    command_code: z.literal("percent_sign").default("percent_sign"),
  }),
  stringify: () => "%",
})
