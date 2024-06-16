import * as Type from "lib/types"

/**
 * Attempt to use RMST, if there's an obstacle collision, switch to the
 * route solver.
 */
export const rmstOrRoute1Solver: Type.RouteSolver = async ({
  terminals,
  obstacles,
}) => {
  throw new Error("rmstOrRoute1Solver not implemented")
}
