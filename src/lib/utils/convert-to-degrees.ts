export const convertToDegrees = (rotation: number | string) => {
  if (typeof rotation === "number") {
    return rotation
  }
  return parseFloat(rotation.split("deg")[0])
}
