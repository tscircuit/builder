import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const define_macro_aperture_template = defineGerberCommand({
  command_code: "AM",
  schema: z
    .object({
      command_code: z.literal("AM").default("AM"),
      macro_name: z.string(),
      template_code: z.string(),
    })
    .describe("Aperture macro: Defines a macro aperture template. 4.5"),
  stringify({ macro_name, template_code }) {
    return `%AM${macro_name}*\n${template_code}%`
  },
})

export type DefineMacroApertureTemplate = z.infer<
  typeof define_macro_aperture_template.schema
>
