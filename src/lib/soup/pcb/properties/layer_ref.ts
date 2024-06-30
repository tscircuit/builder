import { z } from "zod"

/** @deprecated use @tscircuit/soup module */
export const all_layers = [
  "top",
  "bottom",
  "inner1",
  "inner2",
  "inner3",
  "inner4",
  "inner5",
  "inner6",
] as const

/** @deprecated use @tscircuit/soup module */
export const layer_string = z.enum(all_layers)

/** @deprecated use @tscircuit/soup module */
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

/** @deprecated use @tscircuit/soup module */
export type LayerRefInput = z.input<typeof layer_ref>

/** @deprecated use @tscircuit/soup module */
export type LayerRef = z.output<typeof layer_ref>
