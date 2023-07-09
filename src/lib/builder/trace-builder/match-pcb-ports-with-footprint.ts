import type {
  PCBPort,
  SourcePort,
  PCBSMTPad,
  PCBPlatedHole,
  Point,
} from "../../types"

interface Parameters {
  footprint_elements: Array<PCBSMTPad | PCBPlatedHole>
  pcb_ports: Omit<PCBPort, "x" | "y">[]
  source_ports: SourcePort[]
}

const getCenterOfFootprintElement = (elm: PCBSMTPad | PCBPlatedHole): Point => {
  return elm
}

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

  if (footprint_elements.length === 2) {
    const [elm0, elm1] = footprint_elements
    if (elm0.x < elm1.x) {
      addPossibleLabel(0, "left")
      addPossibleLabel(1, "right")
    } else if (elm1.x < elm0.x) {
      addPossibleLabel(1, "left")
      addPossibleLabel(0, "right")
    }
    if (elm0.y < elm1.y) {
      addPossibleLabel(0, "bottom")
      addPossibleLabel(1, "top")
    } else if (elm1.y < elm0.y) {
      addPossibleLabel(1, "bottom")
      addPossibleLabel(0, "top")
    }
  }

  // TODO Add 1,2,3,4,5,... numbering for each pad based on it's CW location

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
          pcb_port.x = x
          pcb_port.y = y
          break
        }
      }
    }
  }
}
