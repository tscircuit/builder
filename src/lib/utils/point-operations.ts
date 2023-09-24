type Point = { x: number; y: number }

export const sumPoints = (points: Array<Point>): Point => {
  return points.reduce(
    (acc, point) => {
      acc.x += point.x
      acc.y += point.y
      return acc
    },
    { x: 0, y: 0 }
  )
}

export const multPoint = (point: Point, factor: number): Point => {
  return {
    x: point.x * factor,
    y: point.y * factor,
  }
}

export const rotatePoint = ({
  point,
  center,
  rotationDeg,
}: {
  point: Point
  center: Point
  rotationDeg: number
}): Point => {
  const rotationRad = (rotationDeg * Math.PI) / 180
  const cos = Math.cos(rotationRad)
  const sin = Math.sin(rotationRad)
  const x = point.x - center.x
  const y = point.y - center.y
  return {
    x: x * cos - y * sin + center.x,
    y: x * sin + y * cos + center.y,
  }
}
