import { z } from "zod"
import { defineExcellonDrillCommand } from "../define-excellon-drill-command"

export const header_attribute = defineExcellonDrillCommand({
  command_code: "header_attribute",
  schema: z.object({
    command_code: z.literal("header_attribute").default("header_attribute"),
    attribute_name: z.string(),
    attribute_value: z.string(),
  }),
  stringify({ attribute_name, attribute_value }) {
    return `; #@! ${attribute_name},${attribute_value}`
  },
})
