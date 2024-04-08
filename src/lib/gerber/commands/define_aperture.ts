import { z } from "zod"

export const define_aperture = z
  .object({
    command_code: z.literal("AD"),
    aperture_code: z.string(),
  })
  .describe(
    "Aperture define: Defines a template-based aperture, assigns a D code to it. 4.3"
  )
export type DefineAperture = z.infer<typeof define_aperture>
