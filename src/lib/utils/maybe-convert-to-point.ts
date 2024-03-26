export const maybeConvertToPoint = (p: unknown): { x: any; y: any } | null => {
  if (p === null) {
    return null
  } else if (Array.isArray(p) && p.length === 2) {
    return { x: p[0], y: p[1] }
  } else if (typeof p === "object" && "x" in p && "y" in p) {
    return p
  }
  return null
}
