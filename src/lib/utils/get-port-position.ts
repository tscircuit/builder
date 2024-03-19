import range from "lodash/range"

export type VerticalPortSideConfiguration = {
  pin_definition_direction?: "top-to-bottom" | "bottom-to-top"
  pins: number[]
}
export type HorizontalPortSideConfiguration = {
  pin_definition_direction?: "left-to-right" | "right-to-left"
  pins: number[]
}

export type ExplicitPinMappingArrangement = {
  left_side?: HorizontalPortSideConfiguration
  right_side?: HorizontalPortSideConfiguration
  top_side?: VerticalPortSideConfiguration
  bottom_side?: VerticalPortSideConfiguration
}
export type SideSizes = {
  left_size?: number
  right_size?: number
  top_size?: number
  bottom_size?: number
}

export type PortArrangement = SideSizes | ExplicitPinMappingArrangement

export const hasExplicitPinMapping = (
  pa: PortArrangement
): pa is ExplicitPinMappingArrangement => {
  return (
    "left_side" in pa ||
    "right_side" in pa ||
    "top_side" in pa ||
    "bottom_side" in pa
  )
}

export const getExplicitToNormalPinMapping = (
  pa: ExplicitPinMappingArrangement
): number[] => {
  const normal_to_explicit: number[] = [0]
  const { left_side, right_side, top_side, bottom_side } = pa
  for (const [side, flipOrderBcSide] of [
    [left_side, false],
    [bottom_side, false],
    [right_side, true],
    [top_side, true],
  ] as const) {
    if (side) {
      const definedOrderNormal =
        side.pin_definition_direction === "left-to-right" ||
        side.pin_definition_direction === "top-to-bottom"

      const definedPins = [...side.pins]
      if (flipOrderBcSide) {
        definedPins.reverse()
      }
      if (!definedOrderNormal) {
        definedPins.reverse()
      }
      for (let i = 0; i < definedPins.length; i++) {
        normal_to_explicit.push(side.pins[i])
      }
    }
  }
  const explicit_to_normal = []
  for (let i = 0; i < normal_to_explicit.length; i++) {
    explicit_to_normal[normal_to_explicit[i]] = i
  }
  return explicit_to_normal
}

export const getSizeOfSidesFromPortArrangement = (
  pa: PortArrangement
): {
  left_size: number
  right_size: number
  top_size: number
  bottom_size: number
} => {
  if (hasExplicitPinMapping(pa)) {
    return {
      left_size: pa.left_side?.pins.length ?? 0,
      right_size: pa.right_side?.pins.length ?? 0,
      top_size: pa.top_side?.pins.length ?? 0,
      bottom_size: pa.bottom_side?.pins.length ?? 0,
    }
  }
  const {
    left_size = 0,
    right_size = 0,
    top_size = 0,
    bottom_size = 0,
  } = pa as any
  return { left_size, right_size, top_size, bottom_size }
}

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

/**
 * These are all the defined port indices, for regular bugs all ports are
 * defined but some bugs have a lot of unused pins, so there will be skipped
 * ports.
 */
export const getPortIndices = (pa: PortArrangement): number[] => {
  if (hasExplicitPinMapping(pa)) {
    const port_indices: number[] = []
    for (const p of [
      ...pa.left_side?.pins,
      ...pa.bottom_side?.pins,
      ...pa.right_side?.pins,
      ...pa.top_side?.pins,
    ]) {
      port_indices.push(p)
    }
    return port_indices
  }
  const { left_size, right_size, top_size, bottom_size } =
    getSizeOfSidesFromPortArrangement(pa)

  return range(1, left_size + right_size + top_size + bottom_size + 1)
}

export const getPortArrangementSize = (
  port_arrangement: PortArrangement
): { width: number; height: number; total_ports: number } => {
  const {
    top_size = 0,
    right_size = 0,
    bottom_size = 0,
    left_size = 0,
  } = getSizeOfSidesFromPortArrangement(port_arrangement)

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
  port_arrangement: PortArrangement,
  position: number
): {
  x: number
  y: number
  side: "top" | "bottom" | "left" | "right"
} => {
  const {
    top_size = 0,
    right_size = 0,
    bottom_size = 0,
    left_size = 0,
  } = getSizeOfSidesFromPortArrangement(port_arrangement)
  const total = top_size + right_size + bottom_size + left_size
  if (position < 1 || position > total) {
    throw new Error(
      `Invalid position ${position} on port arrangement with ${total} ports`
    )
  }

  if (hasExplicitPinMapping(port_arrangement)) {
    // Map position to equivalent position in a normal port mapping
    const og_p = position
    position = getExplicitToNormalPinMapping(port_arrangement)[position]
    // console.log("original position:", og_p, "mapped to:", position)
  }

  let side: "top" | "bottom" | "left" | "right"
  let index: number
  if (position <= left_size) {
    side = "left"
    index = position - 1
  } else if (position <= bottom_size + left_size) {
    side = "bottom"
    index = position - left_size - 1
  } else if (position <= bottom_size + left_size + right_size) {
    side = "right"
    index = position - left_size - bottom_size - 1
  } else {
    side = "top"
    index = position - left_size - bottom_size - right_size - 1
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
