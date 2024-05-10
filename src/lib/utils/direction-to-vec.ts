export const directionToVec = (direction: "up" | "down" | "left" | "right") => {
  if (direction === "up") return { x: 0, y: 1 }
  else if (direction === "down") return { x: 0, y: -1 }
  else if (direction === "left") return { x: -1, y: 0 }
  else if (direction === "right") return { x: 1, y: 0 }
  else throw new Error("Invalid direction")
}

export const vecToDirection = ({ x, y }: { x: number; y: number }) => {
  if (x > y) y = 0
  if (y > x) x = 0
  if (x > 0 && y === 0) return "right"
  else if (x < 0 && y === 0) return "left"
  else if (x === 0 && y > 0) return "up"
  else if (x === 0 && y < 0) return "down"
  else throw new Error(`Invalid vector for direction conversion (${x}, ${y})`)
}

export const rotateClockwise = (
  direction: "up" | "down" | "left" | "right"
) => {
  if (direction === "up") return "right"
  else if (direction === "right") return "down"
  else if (direction === "down") return "left"
  else if (direction === "left") return "up"
  throw new Error(`Invalid direction: ${direction}`)
}

export const rotateCounterClockwise = (
  direction: "up" | "down" | "left" | "right"
) => {
  if (direction === "up") return "left"
  else if (direction === "left") return "down"
  else if (direction === "down") return "right"
  else if (direction === "right") return "up"
  throw new Error(`Invalid direction: ${direction}`)
}

export const rotateDirection = (
  direction: "up" | "down" | "left" | "right",
  num90DegreeClockwiseTurns: number
) => {
  while (num90DegreeClockwiseTurns > 0) {
    direction = rotateClockwise(direction)
    num90DegreeClockwiseTurns--
  }
  while (num90DegreeClockwiseTurns < 0) {
    direction = rotateCounterClockwise(direction)
    num90DegreeClockwiseTurns++
  }
  return direction
}

export const oppositeDirection = (
  direction: "up" | "down" | "left" | "right"
) => {
  if (direction === "up") return "down"
  else if (direction === "down") return "up"
  else if (direction === "left") return "right"
  else if (direction === "right") return "left"
  throw new Error(`Invalid direction: ${direction}`)
}

export const oppositeSide = (
  sideOrDir: "up" | "down" | "top" | "bottom" | "left" | "right"
) => {
  if (sideOrDir === "top" || sideOrDir === "up") return "bottom"
  else if (sideOrDir === "bottom" || sideOrDir === "down") return "top"
  else if (sideOrDir === "left") return "right"
  else if (sideOrDir === "right") return "left"
  throw new Error(`Invalid sideOrDir: ${sideOrDir}`)
}
