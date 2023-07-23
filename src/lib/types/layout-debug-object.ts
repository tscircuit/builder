/**
 * This is a generic sort of layout object, it's representative
 * of most classes of AnyElement
 *
 * @deprecated
 */
export type VagueLayoutObject = (
  | {
      x: number
      y: number
      width: number
      height: number
    }
  | {
      center: { x: number; y: number }
      size?: { width: number; height: number }
    }
  | {
      position: { x: number; y: number }
      anchor: "left"
      text: string
    }
  | {
      x: number
      y: number
      outer_diameter: number
    }
  | {
      x1: number
      y1: number
      x2: number
      y2: number
    }
) & {
  type: string
  text?: string
  name?: string
  source?: { text?: string; name?: string }
}

/**
 * A debugging standard object, it represents the general layout
 * position of an object
 */
export type LayoutDebugObject = {
  x: number
  y: number
  width: number
  height: number
  bg_color: string
  title: string
  content: Object
  secondary?: boolean
}
