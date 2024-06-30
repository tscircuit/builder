import { z } from "zod"
import { point } from "../common"
import { layer_ref } from "./properties/layer_ref"
import { rotation, length } from "../units"

/** @deprecated use @tscircuit/soup module */
export const pcb_component = z
  .object({
    type: z.literal("pcb_component"),
    pcb_component_id: z.string(),
    source_component_id: z.string(),
    center: point,
    layer: layer_ref,
    rotation: rotation,
    width: length,
    height: length,
  })
  .describe("Defines a component on the PCB")

/** @deprecated use @tscircuit/soup module */
export type PCBComponentInput = z.input<typeof pcb_component>
/** @deprecated use @tscircuit/soup module */
export type PCBComponent = z.infer<typeof pcb_component>
