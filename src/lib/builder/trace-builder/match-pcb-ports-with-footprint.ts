import type {
  PCBPort,
  SourcePort,
  PCBSMTPad,
  PCBPlatedHole,
  Point,
  PCBHole,
  PCBVia,
  PCBTrace,
} from "@tscircuit/soup"

interface Parameters {
  footprint_elements: Array<
    PCBSMTPad | PCBPlatedHole | PCBHole | PCBVia | PCBTrace
  >
  pcb_ports: Omit<PCBPort, "x" | "y" | "layers">[]
  source_ports: SourcePort[]
}

type FootprintElement = PCBSMTPad | PCBPlatedHole | PCBHole | PCBVia | PCBTrace
const getCenterOfFootprintElement = (elm: FootprintElement): Point => {
  if (elm.type === "pcb_trace")
    throw new Error(
      `Can't get center of a trace- likely a bug that this function was called`
    )
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
    if (footprint_element.type === "pcb_trace") continue
    if (footprint_element.type.includes("silkscreen")) continue
    if (!("port_hints" in footprint_element)) {
      if (footprint_element.type === "pcb_via") {
        ;(footprint_elements[i] as any).port_hints = []
        continue
      }
      ;(footprint_elements[i] as any).port_hints = []
    }
    if ("port_hints" in footprint_element && footprint_element.port_hints) {
      for (const port_hint of footprint_element.port_hints) {
        addPossibleLabel(i, port_hint)
      }
    }
  }

  for (let i = 0; i < pcb_ports.length; i++) {
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
        if (
          source_port.name === possible_label ||
          source_port.pin_number?.toString() === possible_label
        ) {
          ;(footprint_element as any).pcb_port_id = pcb_port.pcb_port_id
          const { x, y } = getCenterOfFootprintElement(footprint_element)
          ;(pcb_port as any).x = x
          ;(pcb_port as any).y = y
          if ("layers" in footprint_element) {
            ;(pcb_port as any).layers = footprint_element.layers
          } else if ("layer" in footprint_element) {
            ;(pcb_port as any).layers = [footprint_element.layer]
          } else {
            throw new Error(
              `Footprint element has no layers, cannot match port without layers on footprint element.\n\nfootprint_element: ${JSON.stringify(
                footprint_element,
                null,
                "  "
              )}`
            )
          }
          break
        }
      }
    }

    if (!(pcb_port as any).layers) {
      // TODO create a pcb_error element
      // throw new Error(
      //   `pcb_port did not get matched with a footprint element\n\npcb_port: ${JSON.stringify(
      //     pcb_port,
      //     null,
      //     "  "
      //   )}`
      // )
    }
  }
}
