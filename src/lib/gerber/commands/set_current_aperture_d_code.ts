import { z } from "zod"

export const set_current_aperture_d_code = z
  .object({
    command_code: z.literal("Dnn"),
    d_code: z.string(),
  })
  .describe("(nn≥10) Sets the current aperture to D code nn. 4.6")

export type SetCurrentApertureDCode = z.infer<
  typeof set_current_aperture_d_code
>
