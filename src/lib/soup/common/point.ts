import { z } from "zod"

export const point = z.object({
  x: z.number(),
  y: z.number(),
})

export const position = point

export type Point = z.infer<typeof point>
export type Position = z.infer<typeof position>
