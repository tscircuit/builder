import { z } from "zod"

export const add_attribute_on_aperture = z
  .object({
    command_code: z.literal("TA"),
    attribute: z.string(),
  })
  .describe(
    "Add attribute on aperture: Add an aperture attribute to the dictionary or modify it."
  )

export type AddAttributeOnAperture = z.infer<typeof add_attribute_on_aperture>
