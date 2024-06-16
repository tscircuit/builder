import { removeNulls } from "lib/utils/remove-nulls"
import { length } from "@tscircuit/soup"

export const remapProp = (prop: string, val: any): [string, any] => {
  switch (prop) {
    case "schPortArrangement":
      return [
        "port_arrangement",
        removeNulls({
          left_size: val.leftSize,
          right_size: val.rightSize,
          top_size: val.topSize,
          bottom_size: val.bottomSize,
          left_side: val.leftSide,
          right_side: val.rightSide,
          top_side: val.topSide,
          bottom_side: val.bottomSide,
        }),
      ]
    case "pinLabels":
      return ["port_labels", val]
    case "pinSpacing":
    case "schPinSpacing":
      return ["pin_spacing", length.parse(val)]
    default:
      return [prop, val]
  }
}
