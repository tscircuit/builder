import { Dimension, NumberWithAnyUnit } from "./util"

export type BuildContext = {
  distance_unit: "mm" | "in"
  convert(v: NumberWithAnyUnit): number
  convert(v: Dimension): number
  convert(v: { x: Dimension; y: Dimension }): {
    x: number
    y: number
  }

  schematic_component_id?: string
  source_component_id?: string
  pcb_component_id?: string

  parent?: BuildContext
  fork: (mutation: Partial<BuildContext>) => BuildContext
}
