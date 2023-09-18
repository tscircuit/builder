import * as Type from "lib/types"
import { Obstacle } from "@tscircuit/routing"

export const getSchematicObstaclesFromElements = (
  elms: Type.AnyElement[]
): Obstacle[] => {
  const obstacles: Obstacle[] = []

  for (const elm of elms) {
    switch (elm.type) {
      case "schematic_component": {
        obstacles.push({
          center: {
            x: elm.center.x,
            y: elm.center.y,
          },
          width: elm.size.width,
          height: elm.size.height,
        })
        continue
      }
    }
  }
  console.log(obstacles)

  return obstacles
}
