import { z } from "zod"

export const flash_operation = z
  .object({
    command_code: z.literal("D03"),
    coordinates: z.string(),
  })
  .describe(
    "Flash operation: Creates a flash object with the current aperture. The current point is moved to the flash point."
  )

export type FlashOperation = z.infer<typeof flash_operation>
