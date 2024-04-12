import { z } from "zod"
import { defineExcellonDrillCommand } from "../define-excellon-drill-command"

export const drill_at = defineExcellonDrillCommand({
  command_code: "drill_at",
  schema: z.object({
    command_code: z.literal("drill_at").default("drill_at"),
    x: z.number(),
    y: z.number(),
  }),
  stringify: (c) => `X${c.x.toFixed(4)}Y${c.y.toFixed(4)}`,
})
