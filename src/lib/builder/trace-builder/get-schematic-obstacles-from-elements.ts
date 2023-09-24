import * as Type from "lib/types"

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
          w: elm.size.width,
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
    }
  }

  return obstacles
}
