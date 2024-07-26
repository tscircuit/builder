import { createProjectBuilder } from "../../src/lib/builder/project-builder"
import test from "ava"

test("group builder with routingDisabled", async (t) => {
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
  t.true(schematicTraces.length > 0)

  // Check that source traces are present
  const sourceTraces = elements.filter((el) => el.type === "source_trace")
  t.true(sourceTraces.length > 0)

  // Check that PCB traces and vias are not present
  const pcbTraces = elements.filter((el) => el.type === "pcb_trace")
  t.is(pcbTraces.length, 0)

  const pcbVias = elements.filter((el) => el.type === "pcb_via")
  t.is(pcbVias.length, 0)
})
