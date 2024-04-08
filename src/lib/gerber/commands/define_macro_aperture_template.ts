import { z } from "zod"

export const define_macro_aperture_template = z
  .object({
    command_code: z.literal("AM"),
    template_code: z.string(),
  })
  .describe("Aperture macro: Defines a macro aperture template. 4.5")
export type DefineMacroApertureTemplate = z.infer<
  typeof define_macro_aperture_template
>
