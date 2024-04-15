import { AnySoupElement, PCBComponent } from "lib/soup"
import { SourceComponent } from "lib/types"

interface BomRow {
  designator: string
  comment: string
  value: string
  footprint: string
  part_number: string
}

type ManufacturerPartNumberColumn = "JLCPCB Part#"

interface ResolvedPart {
  part_number?: string
  footprint?: string
  comment?: string
  manufacturer_part_number_columns?: Record<
    ManufacturerPartNumberColumn,
    string
  >
  manufacturer_mpn_pairs?: Array<{
    manufacturer: string
    mpn: string
  }>
  extra_columns?: Record<string, string>
}

// HEADERS FROM DIFFERENT bom.csv FILES
// Comment Designator Footprint "JLCPCB Part#(optional)"
// Designator Value Footprint Populate MPN Manufacturer MPN Manufacturer MPN Manufacturer MPN Manufacturer MPN Manufacturer

export const convertSoupToBomRows = async ({
  soup,
  resolvePart,
}: {
  soup: AnySoupElement[]
  resolvePart: (part_info: {
    source_component: SourceComponent
    pcb_component: PCBComponent
  }) => Promise<ResolvedPart | null>
}): Promise<BomRow[]> => {
  const bom: BomRow[] = []
  for (const elm of soup) {
    if (elm.type !== "pcb_component") continue

    const source_component = soup.find(
      (e) =>
        e.type === "source_component" &&
        e.source_component_id === elm.source_component_id
    ) as any as SourceComponent

    const partInfo: Partial<ResolvedPart> =
      (await resolvePart?.({ pcb_component: elm, source_component })) ?? {}

    const {
      part_number = elm,
      footprint,
      comment,
      manufacturer_part_number_columns,
      manufacturer_mpn_pairs,
      extra_columns,
    } = partInfo

    bom.push({
      designator: elm.pcb_component_id,
      comment: comment || "",
      value: elm.value,
      footprint: footprint || "",
      part_number: part_number || "",
    })

    // bom.push({

    // })
  }

  return bom
}
