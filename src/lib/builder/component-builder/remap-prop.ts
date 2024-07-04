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
    case "pcbX":
      return ["pcb_x", length.parse(val)]
    case "pcbY":
      return ["pcb_y", length.parse(val)]
    case "pcbRotation":
      return ["pcb_rotation", val]
    case "pinLabels":
    case "schPinLabels":
      return ["port_labels", val]
    case "pinSpacing":
    case "schPinSpacing":
      return ["pin_spacing", length.parse(val)]
    case "schX":
      return ["x", length.parse(val)]
    case "schY":
      return ["y", length.parse(val)]
    default:
      return [prop, val]
  }
}
