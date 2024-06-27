import * as Type from "lib/types"
import { logSoup } from "@tscircuit/log-soup"

type Obstacle2 = {
  cx: number
  cy: number
  w: number
  h: number
}

type Options = {
  excluded_schematic_port_ids?: string[]
}

export const getSchematicObstaclesFromElements = (
  elms: Type.AnyElement[],
  opts?: Options
): Array<Obstacle2> => {
  const obstacles: Obstacle2[] = []
  for (const elm of elms) {
    switch (elm.type) {
      case "schematic_component": {
        obstacles.push({
          cx: elm.center.x,
          cy: elm.center.y,
          w: elm.size.width * 2,
          h: elm.size.height,
        })
        continue
      }
      case "schematic_port": {
        if (opts?.excluded_schematic_port_ids?.includes(elm.schematic_port_id))
          continue
        obstacles.push({
          cx: elm.center.x,
          cy: elm.center.y,
          w: 0.4,
          h: 0.4,
        })
        continue
      }
      case "schematic_net_label": {
        let offsetX = 0,
          offsetY = 0
        const labelWidth = 0.4 + elm.text.length * 0.1
        const labelHeight = 0.4

        // Adjust the obstacle position based on the anchor side
        switch (elm.anchor_side) {
          case "top":
            offsetY = -labelHeight / 2
            break
          case "bottom":
            offsetY = labelHeight / 2
            break
          case "left":
            offsetX = 0
            break
          case "right":
            offsetX = 0
            break
        }

        obstacles.push({
          cx: elm.center.x + offsetX,
          cy: elm.center.y + offsetY,
          w: labelWidth,
          h: labelHeight,
        })
        continue
      }
    }
  }

  console.log(obstacles)
  logSoup(
    "seveibar - test",
    obstacles.map((o) => ({
      center: { x: o.cx, y: -o.cy },
      size: { width: o.w, height: o.h },
    }))
  )
  return obstacles
}
