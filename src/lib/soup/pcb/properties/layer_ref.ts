import { z } from "zod"

export const all_layers = [
  "top",
  "bottom",
  "inner-1",
  "inner-2",
  "inner-3",
  "inner-4",
  "inner-5",
  "inner-6",
] as const

export const layer_string = z.enum(all_layers)

export const layer_ref = layer_string
  .or(
    z.object({
      name: layer_string,
    })
  )
  .transform((layer) => {
    if (typeof layer === "string") {
      return layer
    }
    return layer.name
  })

export type LayerRefInput = z.input<typeof layer_ref>
export type LayerRef = z.output<typeof layer_ref>
