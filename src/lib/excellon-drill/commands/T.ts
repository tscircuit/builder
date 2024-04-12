import { z } from "zod"
import { defineExcellonDrillCommand } from "../define-excellon-drill-command"

export const T = defineExcellonDrillCommand({
  command_code: "T",
  schema: z.object({
    command_code: z.literal("T").default("T"),
    tool_number: z.number(),
    diameter: z.number(),
  }),
  stringify: (c) => `T${c.tool_number}C${c.diameter}`,
})
