import { AnySoupElement, LayerRef } from "lib/soup"
import Papa from "papaparse"

interface PickAndPlaceRow {
  designator: string
  mid_x: number
  mid_y: number
  layer: LayerRef
  rotation: number
}

export const convertSoupToPickAndPlaceRows = (
  soup: AnySoupElement[],
  opts: { flip_y_axis?: boolean } = {}
): PickAndPlaceRow[] => {
  opts.flip_y_axis ??= true

  const rows: PickAndPlaceRow[] = []
  for (const element of soup) {
    if (element.type === "pcb_component") {
      rows.push({
        designator: element.pcb_component_id,
        mid_x: element.center.x,
        mid_y: element.center.y * (opts.flip_y_axis ? -1 : 1),
        layer: element.layer,
        rotation: element.rotation,
      })
    }
  }
  return rows
}

export const convertSoupToPickAndPlaceCsv = (soup: AnySoupElement[]): string =>
  Papa.unparse(
    convertSoupToPickAndPlaceRows(soup).map((row) => ({
      Designator: row.designator,
      "Mid X": row.mid_x,
      "Mid Y": row.mid_y,
      Layer: row.layer,
      Rotation: row.rotation,
    }))
  )
