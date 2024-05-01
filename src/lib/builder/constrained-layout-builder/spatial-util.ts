import { AnyElement } from "lib/types"

export type SpatialElement = { x: number; y: number; w: number; h: number }

export const getSpatialBoundsFromSpatialElements = (
  elements: SpatialElement[]
) => {
  if (elements.length === 0) return { x: 0, y: 0, w: 0, h: 0 }
  let { x: lx, y: ly, w, h } = elements[0]
  lx -= w / 2
  ly -= h / 2
  let hx = lx + w
  let hy = ly + h
  for (let i = 1; i < elements.length; i++) {
    const { x, y, w, h } = elements[i]
    lx = Math.min(lx, x - w / 2)
    ly = Math.min(ly, y - h / 2)
    hx = Math.max(hx, x + w / 2)
    hy = Math.max(hy, y + h / 2)
  }
  return {
    x: (lx + hx) / 2,
    y: (ly + hy) / 2,
    w: hx - lx, //
    h: hy - ly,
  }
}

export const toCenteredSpatialObj = (obj: any): SpatialElement => {
  let x = obj.x ?? obj.center?.x
  let y = obj.y ?? obj.center?.y
  let w = obj.w ?? obj.width ?? obj.size?.width ?? obj.outer_diameter ?? 0
  let h = obj.h ?? obj.height ?? obj.size?.height ?? obj.outer_diameter ?? 0
  let align = obj.align ?? "center"

  if (
    obj.x1 !== undefined &&
    obj.x2 !== undefined &&
    obj.y1 !== undefined &&
    obj.y2 !== undefined
  ) {
    // It's a line
    x = (obj.x1 + obj.x2) / 2
    y = (obj.y1 + obj.y2) / 2
    w = Math.abs(obj.x1 - obj.x2)
    h = Math.abs(obj.y1 - obj.y2)
  }

  if (x === undefined || y === undefined) {
    throw new Error(
      `Cannot convert to spatial obj (no x,y): ${JSON.stringify(
        obj,
        null,
        "  "
      )}`
    )
  }
  if (align !== "center") {
    throw new Error(
      `Cannot convert to spatial obj (align not center not implemented): ${JSON.stringify(
        obj,
        null,
        "  "
      )}`
    )
  }

  return { x, y, w, h }
}

/**
 * Get element size with any children elements. e.g. for a pcb component,
 * compute it's size from it's children.
 */
export const getSpatialElementIncludingChildren = (
  elm: AnyElement,
  elements: AnyElement[]
): SpatialElement => {
  if (elm.type === "pcb_component") {
    const children = getElementChildren(elm, elements).map((e) =>
      toCenteredSpatialObj(e)
    )
    return getSpatialBoundsFromSpatialElements(children)
    // component size is computed from children
  } else if (elm.type === "schematic_component") {
    return toCenteredSpatialObj(elm)
  }
  throw new Error(
    `Get spatial elements including children not implemented for: "${elm.type}"`
  )
}

export const getElementChildren = (
  matchElm: AnyElement,
  elements: AnyElement[]
) => {
  // TODO get deep children
  return elements.filter(
    (elm) =>
      elm[`${matchElm.type}_id`] === matchElm[`${matchElm.type}_id`] &&
      elm !== matchElm
  )
}
