import { z } from "zod"
import { defineExcellonDrillCommand } from "../define-excellon-drill-command"

export const aper_function_header = defineExcellonDrillCommand({
  command_code: "aper_function_header",
  schema: z.object({
    command_code: z
      .literal("aper_function_header")
      .default("aper_function_header"),
    is_plated: z.boolean(),
  }),
  stringify({ is_plated }) {
    if (!is_plated) {
      throw new Error("not implemented")
    }
    return `; #@! TA.AperFunction,Plated,PTH,ComponentDrill`
  },
})
