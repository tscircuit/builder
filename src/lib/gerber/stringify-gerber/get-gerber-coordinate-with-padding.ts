/**
 * Retrieves the Gerber coordinate with padding.
 *
 * Example Gerber coordinate strings:
 * full string: X110550000Y-85000000D03*
 * formatted coordinate for X: 110550000
 *
 * Example inputs/outputs:
 * input: 110.55
 * output: 110550000
 *
 * @param coordinate_mm - The coordinate value in millimeters.
 * @returns The Gerber coordinate with padding.
 */
export const getGerberCoordinateWithPadding = (
  coordinate_mm: number
): string => {
  const coordinate_um = coordinate_mm * 1000000 // Convert millimeters to micrometers
  let coordinate_str = coordinate_um.toFixed(0) // Convert to string without decimal places
  // add left padding
  while (coordinate_str.length < 9) {
    if (coordinate_um < 0) {
      coordinate_str = "-0" + coordinate_str.slice(1)
    } else {
      coordinate_str = "0" + coordinate_str
    }
  }
  return coordinate_str
}
