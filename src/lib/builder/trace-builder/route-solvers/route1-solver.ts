import * as Type from "lib/types"
import {
  findSchematicRoute,
  movePointsOutsideObstacles,
} from "@tscircuit/routing"
import { straightRouteSolver } from "./straight-route-solver"

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

  const pathFindingParams = {
    pointsToConnect: terminals,
    obstacles: transformedObstacles,
    grid: {
      maxGranularSearchSegments: 50,
      marginSegments: 10,
      segmentSize: 0.1,
    },
  }

  const result = findSchematicRoute(
    movePointsOutsideObstacles(pathFindingParams)
  )

  // TODO log pathFindingParams for submission to
  // https://routing.tscircuit.com for debugging
  // console.dir(pathFindingParams, { depth: 10 })

  if (!result.pathFound) {
    return straightRouteSolver({ terminals, obstacles })
  }

  // TODO this should be handled in findSchematicRoute, but for now
  // find the point/terminal association for each returned point along
  // the route
  // const terminalIndexToPointIndex: Record<number, number> = {}
  // for (let i = 0; i < terminals.length; i++) {
  //   const terminal = terminals[i]
  //   let closestDist = Infinity
  //   let closestPointIndex = -1
  //   for (let j = 0; j < result.points.length; j++) {
  //     const point = result.points[j]
  //     const dist = Math.hypot(point[0] - terminal[0], point[1] - terminal[1])
  //     if (dist < closestDist) {
  //       closestDist = dist
  //       closestPointIndex = j
  //     }
  //   }
  //   terminalIndexToPointIndex[i] = closestPointIndex
  // }

  // const edges = result.points.map(
  //   ({ from, to, fromTerminalIndex, toTerminalIndex }) => ({
  //     from: { x: from[0], y: from[1], ti: fromTerminalIndex },
  //     to: { x: to[0], y: to[1], ti: toTerminalIndex },
  //   })
  // )

  return result.points.slice(0, -1).map((point, i) => ({
    from: point,
    to: result.points[i + 1],
  }))
}
