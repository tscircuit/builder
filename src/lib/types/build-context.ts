import {NumberWithAnyUnit} from "./util"

export type BuildContext = {
  distance_unit: "mm" | "in"
  convert: (v: NumberWithAnyUnit) => number
}