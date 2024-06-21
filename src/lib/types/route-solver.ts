export type RouteEdge = {
  from: { x: number; y: number }
  to: { x: number; y: number }
}

export type Terminal = {
  x: number
  y: number
  facing_direction?: "up" | "down" | "left" | "right"
}

export type RouteSolver = (params: {
  terminals: readonly Terminal[]
  obstacles: Array<{ cx: number; cy: number; w: number; h: number }>
}) => Promise<Array<RouteEdge>>
