import { createProjectBuilder } from "../../src/lib/builder/project-builder"
import { expect, test } from "vitest"

test("group builder with routingDisabled", async () => {
  const project = createProjectBuilder()

  const group = project.addGroup((g) => {
    g.setProps({ routingDisabled: true })

    g.addResistor((r) => {
      r.setProps({ resistance: "1kohm", name: "R1" })
    })

    g.addCapacitor((c) => {
      c.setProps({ capacitance: "10uF", name: "C1" })
    })

    g.addTrace((t) => {
      t.addConnections([".R1 > .left", ".C1 > .left"])
    })
  })

  const elements = await project.build()

  // Check that schematic traces are present
  const schematicTraces = elements.filter((el) => el.type === "schematic_trace")
  expect(schematicTraces.length).toBeGreaterThan(0)

  // Check that source traces are present
  const sourceTraces = elements.filter((el) => el.type === "source_trace")
  expect(sourceTraces.length).toBeGreaterThan(0)

  // Check that PCB traces and vias are not present
  const pcbTraces = elements.filter((el) => el.type === "pcb_trace")
  expect(pcbTraces.length).toBe(0)

  const pcbVias = elements.filter((el) => el.type === "pcb_via")
  expect(pcbVias.length).toBe(0)
})
