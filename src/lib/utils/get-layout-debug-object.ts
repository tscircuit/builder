import { LayoutDebugObject } from "lib/types"
import colors from "nice-color-palettes"
import { stringHash } from "./string-hash"

export const getDebugLayoutObject = (lo: any): LayoutDebugObject | null => {
  let {
    x,
    y,
    width,
    height,
  }: { x: number; y: number; width?: number; height?: number } = {
    ...lo,
    ...(lo as any).size,
    ...(lo as any).center,
    ...(lo as any).position,
  }

  if (
    lo.x1 !== undefined &&
    lo.x2 !== undefined &&
    lo.y1 !== undefined &&
    lo.y2 !== undefined
  ) {
    x = (lo.x1 + lo.x2) / 2
    y = (lo.y1 + lo.y2) / 2
    width = Math.abs(lo.x1 - lo.x2)
    height = Math.abs(lo.y1 - lo.y2)
  }

  const title = lo.text || lo.name || lo.source?.text || lo.source?.name || "?"
  const content = lo

  if (x === undefined || y === undefined) return null

  if (width === undefined) {
    if ("outer_diameter" in lo) {
      width = lo.outer_diameter
      height = lo.outer_diameter
    }
  }

  if (width === undefined || height === undefined) {
    width = 0.1
    height = 0.1
  }

  return {
    x,
    y,
    width,
    height,
    title,
    content,
    bg_color: colors[stringHash((lo as any).type || title) % colors.length]?.[4] ?? "#f00",
  }
}
