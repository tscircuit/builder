import type {
  PCBPort,
  SourcePort,
  PCBSMTPad,
  PCBPlatedHole,
  Point,
  PCBHole,
} from "../../types"

interface Parameters {
  footprint_elements: Array<PCBSMTPad | PCBPlatedHole | PCBHole>
  pcb_ports: Omit<PCBPort, "x" | "y">[]
  source_ports: SourcePort[]
}

const getCenterOfFootprintElement = (
  elm: PCBSMTPad | PCBPlatedHole | PCBHole
): Point => {
  return elm
}

/**
 * Matches footprint pads/holes with pcb ports (and the schematic)
 *
 * See match-pcb-ports-with-footprint.test.ts for example
 */
export const matchPCBPortsWithFootprintAndMutate = ({
  footprint_elements,
  pcb_ports,
  source_ports,
}: Parameters): void => {
  const possible_labels_for_element_map: Array<string[]> =
    footprint_elements.map(() => [])
  const addPossibleLabel = (elm_index: number, label: string) => {
    if (!possible_labels_for_element_map[elm_index]) {
      possible_labels_for_element_map[elm_index] = []
    }
    possible_labels_for_element_map[elm_index].push(label)
  }

  for (let i = 0; i < footprint_elements.length; i++) {
    const footprint_element = footprint_elements[i]
    if (footprint_element.type === "pcb_hole") continue
    if (!("port_hints" in footprint_element)) {
      // TODO error
      console.warn(
        `Footprint element has an undefined port_hints array: ${JSON.stringify(
          footprint_elements[i],
          null,
          "  "
        )}`
      )
      ;(footprint_elements[i] as any).port_hints = []
    }
    if ("port_hints" in footprint_element && footprint_element.port_hints) {
      for (const port_hint of footprint_element.port_hints) {
        addPossibleLabel(i, port_hint)
      }
    }
  }

  for (let i = 0; i < pcb_ports.length, i < source_ports.length; i++) {
    const pcb_port = pcb_ports[i]
    const source_port = source_ports.find(
      (sp) => sp.source_port_id == pcb_port.source_port_id
    )
    if (!source_port)
      throw new Error(`PCB port ${pcb_port.pcb_port_id} has no source port`)

    // Iterate over each possible label for each footprint element and see if
    // one is a good match
    for (let fpei = 0; fpei < footprint_elements.length; fpei++) {
      const footprint_element = footprint_elements[fpei]
      const possible_labels_for_element = possible_labels_for_element_map[fpei]
      for (const possible_label of possible_labels_for_element) {
        if (source_port.name === possible_label) {
          ;(footprint_element as any).pcb_port_id = pcb_port.pcb_port_id
          const { x, y } = getCenterOfFootprintElement(footprint_element)
          ;(pcb_port as any).x = x
          ;(pcb_port as any).y = y
          break
        }
      }
    }
  }
}
