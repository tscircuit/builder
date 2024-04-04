import { z } from "zod"

export const layer_string = z.enum([
  "top",
  "bottom",
  "inner-1",
  "inner-2",
  "inner-3",
  "inner-4",
  "inner-5",
  "inner-6",
])

export const layer_ref = layer_string

export type LayerRefInput = z.input<typeof layer_ref>
export type LayerRef = z.output<typeof layer_ref>
