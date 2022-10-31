import {NumberWithAnyUnit} from "./util"

export type BuildContext = {
  unit_distance: "mm" | "in"
  convert: (v: NumberWithAnyUnit) => number
}