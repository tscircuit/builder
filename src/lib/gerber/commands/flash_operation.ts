import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"
import { getGerberCoordinateWithPadding } from "../stringify-gerber/get-gerber-coordinate-with-padding"

export const flash_operation = defineGerberCommand({
  command_code: "D03",
  schema: z
    .object({
      command_code: z.literal("D03").default("D03"),
      x: z.number(),
      y: z.number(),
    })
    .describe(
      "Flash operation: Creates a flash object with the current aperture. The current point is moved to the flash point."
    ),
  stringify({ x, y }) {
    const [gx, gy] = [x, y].map((coord) =>
      getGerberCoordinateWithPadding(coord)
    )
    return `X${gx}Y${gy}D03*`
  },
})

export type FlashOperation = z.infer<typeof flash_operation.schema>
