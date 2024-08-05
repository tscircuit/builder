export const maybeConvertToPoint = (p: unknown): { x: any; y: any } | null => {
  if (p === null) {
    return null;
  }
  if (Array.isArray(p) && p.length === 2) {
    return { x: p[0], y: p[1] };
  }
  if (typeof p === "object") {
    const x = "x" in p ? p.x : undefined;
    const y = "y" in p ? p.y : undefined;
    if (x !== undefined || y !== undefined) {
      return { x, y };
    }
  }
  return null;
}