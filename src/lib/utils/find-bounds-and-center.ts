import { AnyElement } from "lib/types/core"
import { getDebugLayoutObject } from "./get-layout-debug-object"
import { isTruthy } from "./is-truthy"

export const findBoundsAndCenter = (
  elms: AnyElement[]
): { center: { x: number; y: number }; width: number; height: number } => {
  const debugObjects = elms
    .map((elm) => getDebugLayoutObject(elm))
    .filter(isTruthy)

  let minX = debugObjects[0].x
  let maxX = debugObjects[0].x + debugObjects[0].width / 2
  let minY = debugObjects[0].y
  let maxY = debugObjects[0].y + debugObjects[0].height / 2

  for (const obj of debugObjects.slice(1)) {
    minX = Math.min(minX, obj.x)
    maxX = Math.max(maxX, obj.x + obj.width / 2)
    minY = Math.min(minY, obj.y)
    maxY = Math.max(maxY, obj.y + obj.height / 2)
  }

  const width = maxX - minX
  const height = maxY - minY
  const center = { x: minX + width / 2, y: minY + height / 2 }

  return { center, width, height }
}
