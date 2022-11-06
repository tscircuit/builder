import { NumberWithAnyUnit } from "./util"

export type BuildContext = {
  distance_unit: "mm" | "in"
  convert: (v: NumberWithAnyUnit) => number

  schematic_component_id?: string

  parent?: BuildContext
  fork: (mutation: Partial<BuildContext>) => BuildContext
}
