import { length } from "@tscircuit/soup"
import { removeNulls } from "lib/utils/remove-nulls"

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
          schWidth: val.schWidth,
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
    case "holeDiameter":
      return ["hole_diameter", length.parse(val)]
    case "outerDiameter":
      return ["outer_diameter", length.parse(val)]
    case "outerWidth":
      return ["outer_width", length.parse(val)]
    case "outerHeight":
      return ["outer_height", length.parse(val)]
    case "holeWidth":
      return ["hole_width", length.parse(val)]
    case "holeHeight":
      return ["hole_height", length.parse(val)]
    case "schX":
      return ["x", length.parse(val)]
    case "schY":
      return ["y", length.parse(val)]
    default:
      return [prop, val]
  }
}
