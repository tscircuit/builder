import test from "ava"
import { matchPCBPortsWithFootprintAndMutate } from "lib/builder/trace-builder/match-pcb-ports-with-footprint"

test("match pcb ports with footprint", async (t) => {
  const scenario = {
    footprint_elements: [
      {
        type: "pcb_smtpad" as const,
        shape: "rect" as const,
        x: -0.5,
        y: 0,
        width: 0.6,
        height: 0.6,
        layer: { name: "top" },
        pcb_component_id: "pcb_component_simple_resistor_0",
        port_hints: ["left", "1"],
      },
      {
        type: "pcb_smtpad" as const,
        shape: "rect" as const,
        x: 0.5,
        y: 0,
        width: 0.6,
        height: 0.6,
        layer: { name: "top" },
        pcb_component_id: "pcb_component_simple_resistor_0",
        port_hints: ["right", "2"],
      },
    ],
    pcb_ports: [
      {
        type: "pcb_port" as const,
        pcb_port_id: "pcb_port_0",
        source_port_id: "source_port_0",
      },
      {
        type: "pcb_port" as const,
        pcb_port_id: "pcb_port_1",
        source_port_id: "source_port_1",
      },
    ],
    source_ports: [
      {
        type: "source_port" as const,
        name: "left",
        source_port_id: "source_port_0",
        source_component_id: "simple_resistor_0",
      },
      {
        type: "source_port" as const,
        name: "right",
        source_port_id: "source_port_1",
        source_component_id: "simple_resistor_0",
      },
    ],
  }
  matchPCBPortsWithFootprintAndMutate(scenario)
  t.is((scenario.pcb_ports[0] as any).x, -0.5)
  t.is((scenario.pcb_ports[1] as any).x, 0.5)
})
