import { RouteSolver } from "lib/types"
import { directionToVec } from "lib/utils/direction-to-vec"

/**
 * This route-solver wrapper moves the terminals forward by the direction
 * they're facing before route-solving and creates the associated edges.
 *
 * This ensures that the direction of the line out of each terminal is the
 * direction each terminal is facing.
 */
export const portOffsetWrapper =
  (routeSolver: RouteSolver): RouteSolver =>
  async ({ terminals, obstacles }: Parameters<RouteSolver>[0]) => {
    const offsetTerminals = terminals.map((t) => {
      if (!t.facing_direction) return t
      const dir = directionToVec(t.facing_direction)
      return {
        ...t,
        x: t.x + dir.x * 0.15, // move away by 0.15mm on X axis
        y: t.y + dir.y * 0.15, // move away by 0.15mm on Y axis
      }
    })

    let edges = await routeSolver({
      terminals: offsetTerminals,
      obstacles,
    })

    // Add edges from the original terminal points to the offset terminal points
    // TODO maybe add these in the correct order
    // TODO maybe use a faster algo, this has N^2 complexity
    edges = edges.concat(
      terminals.map((t, i) => {
        const ot = offsetTerminals[i]

        // Find nearest point in the route to the offset terminal
        const nearestPoint = edges
          .flatMap((edge) => [edge.from, edge.to])
          .reduce(
            (nearest, p) => {
              const dist = Math.hypot(p.x - ot.x, p.y - ot.y)
              if (dist < nearest.dist) return { dist, point: p }
              return nearest
            },
            { dist: Infinity, point: { x: 0, y: 0 } }
          )

        return {
          from: { x: t.x, y: t.y, ti: i },
          to: nearestPoint.point,
        }
      })
    )

    return edges
  }
