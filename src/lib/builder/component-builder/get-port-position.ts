/**
 * Minimum distance between two sides, e.g. if there is only a left_size and
 * right_size provided (only pins on left and right) then the minimum distance
 * is the x distance between the left and right ports.
 */
const MIN_SIDE_DIST = 1.5

/**
 * Distance between ports on the same side
 */
const PORT_SPACING = 0.5

export const getPortArrangementSize = (port_arrangement: {
  left_size: number
  right_size: number
  top_size: number
  bottom_size: number
}): { width: number; height: number; total_ports: number } => {
  const { top_size, right_size, bottom_size, left_size } = port_arrangement
  const total_ports = top_size + right_size + bottom_size + left_size
  const width = Math.max(
    MIN_SIDE_DIST,
    (top_size + 1) * PORT_SPACING,
    (bottom_size + 1) * PORT_SPACING
  )
  const height = Math.max(
    MIN_SIDE_DIST,
    (left_size + 1) * PORT_SPACING,
    (right_size + 1) * PORT_SPACING
  )
  return { width, height, total_ports }
}

/**
 * Get the position of a port given a port arrangement. The position corresponds
 * to the index of the port if you travel counter-clockwise starting from the
 * top-left and traveling down the left side. The index begins with 1.
 */
export const getPortPosition = (
  port_arrangement: {
    left_size: number
    right_size: number
    top_size: number
    bottom_size: number
  },
  position: number
): {
  x: number
  y: number
  side: "top" | "bottom" | "left" | "right"
} => {
  const { top_size, right_size, bottom_size, left_size } = port_arrangement
  const total = top_size + right_size + bottom_size + left_size
  if (position < 1 || position > total) {
    throw new Error(
      `Invalid position ${position} on port arrangement with ${total} ports`
    )
  }

  let side: "top" | "bottom" | "left" | "right"
  let index: number
  if (position <= top_size) {
    side = "top"
    index = position - 1
  } else if (position <= top_size + right_size) {
    side = "right"
    index = position - top_size - 1
  } else if (position <= top_size + right_size + bottom_size) {
    side = "bottom"
    index = position - top_size - right_size - 1
  } else {
    side = "left"
    index = position - top_size - right_size - bottom_size - 1
  }

  const { width, height } = getPortArrangementSize(port_arrangement)

  let x: number
  let y: number
  if (side === "top") {
    const i_dist_center = index - (top_size - 1) / 2
    x = i_dist_center * PORT_SPACING
    y = -height / 2
  } else if (side === "bottom") {
    const i_dist_center = index - (bottom_size - 1) / 2
    x = i_dist_center * PORT_SPACING
    y = height / 2
  } else if (side === "left") {
    const i_dist_center = index - (left_size - 1) / 2
    y = i_dist_center * PORT_SPACING
    x = -width / 2
  } else if (side === "right") {
    const i_dist_center = index - (right_size - 1) / 2
    y = i_dist_center * PORT_SPACING
    x = width / 2
  }

  return { x, y, side }
}

export default getPortPosition
