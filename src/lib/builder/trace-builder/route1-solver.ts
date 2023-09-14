import * as Type from "lib/types"
import { findSchematicRoute } from "@tscircuit/routing"

/**
 * Uses a path-finding algorithm with a simplification step. It's tuned to
 * generally work but given version 1 to reflect the tuning goal/method/determinism.
 *
 * Tuning goals:
 * * Path should approximately minimize turns, but it's ok to make an incorrect
 *   turn as long as no wrong turn ever takes you temporarily further from the
 *   objective.
 */
export const route1Solver: Type.RouteSolver = async ({
  terminals,
  obstacles,
}) => {
  const transformedObstacles = obstacles.map((obstacle) => ({
    center: { x: obstacle.cx, y: obstacle.cy },
    width: obstacle.w,
    height: obstacle.h,
  }))

  const result = findSchematicRoute({
    pointsToConnect: terminals,
    obstacles: transformedObstacles,
    grid: {
      maxGranularSearchSegments: 200,
      marginSegments: 1,
      segmentSize: 0.1,
    },
  })

  if (!result.pathFound) return []

  // return result.points.map(

  throw new Error("route1Solver not implemented")
}
