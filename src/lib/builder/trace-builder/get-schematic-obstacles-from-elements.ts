import * as Type from "lib/types"

type Obstacle2 = {
  cx: number
  cy: number
  w: number
  h: number
}

export const getSchematicObstaclesFromElements = (
  elms: Type.AnyElement[]
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
    }
  }

  return obstacles
}
