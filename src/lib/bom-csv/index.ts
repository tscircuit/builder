import { AnySoupElement, PCBComponent } from "lib/soup"

interface BomRow {
  designator: string
  comment: string
  value: string
  footprint: string
  part_number: string
}

type ManufacturerPartNumberColumn = "NPN"

export const convertSoupToBomRows = async ({
  soup,
  resolvePart,
}: {
  soup: AnySoupElement[]
  resolvePart: (part_info: { component: PCBComponent }) => Promise<{
    part_number?: string
    footprint?: string
    comment?: string
    manufacturer_part_number_columns?: Record<
      ManufacturerPartNumberColumn,
      string
    >
  } | null>
}): Promise<BomRow[]> => {
  const bom: BomRow[] = []
  for (const elm of soup) {
    if (elm.type !== "pcb_component") continue

    // bom.push({})
  }

  return bom
}
