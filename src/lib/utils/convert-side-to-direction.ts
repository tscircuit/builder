export const convertSideToDirection = (
  side: "top" | "bottom" | "left" | "right"
): "up" | "down" | "left" | "right" => {
  if (side === "top") return "up"
  if (side === "bottom") return "down"
  return side
}
