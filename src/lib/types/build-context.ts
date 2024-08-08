import type { LayerRef } from "@tscircuit/soup"
import type { Dimension, NumberWithAnyUnit } from "./util"

export type BuildContext = {
  distance_unit: "mm" | "in"
  convert(v: NumberWithAnyUnit): number
  convert(v: number): number
  convert(v: string | number): number
  convert(v: Dimension): number
  convert(v: { x: Dimension; y: Dimension }): {
    x: number
    y: number
  }
  convert(v: string): number

  getId: (prefix: string) => string

  schematic_component_id?: string
  source_component_id?: string
  pcb_component_id?: string
  all_copper_layers: LayerRef[]

  board_thickness?: number

  routing_disabled?: boolean

  source_ports_for_nets_in_group?: Record<string, string[]>

  parent?: BuildContext
  fork: (mutation: Partial<BuildContext>) => BuildContext
}
