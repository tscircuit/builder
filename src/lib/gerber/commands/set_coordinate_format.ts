import { z } from "zod"

export const set_coordinate_format = z
  .object({
    command_code: z.literal("FS"),
    format: z.string(),
  })
  .describe("Sets the coordinate format, e.g. the number of decimals.")
export type SetCoordinateFormat = z.infer<typeof set_coordinate_format>
