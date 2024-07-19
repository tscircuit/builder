import type { SchematicComponent } from "@tscircuit/soup"
import test from "ava"
import { createConstrainedLayoutBuilder, createProjectBuilder } from "../../src"
import { logLayout } from "../utils/log-layout"

test("basic schematic constraint builder test", async (t) => {
  const pb = createProjectBuilder()
  const cb = createConstrainedLayoutBuilder(pb)
    .add("resistor", (rb) =>
      rb.setSourceProperties({
        resistance: "10 ohm",
        name: "R1",
      })
    )
    .add("capacitor", (cb) =>
      cb.setSourceProperties({
        name: "C1",
        capacitance: "10 uF",
      })
    )
    .addConstraint({
      type: "xdist",
      schematic: true,
      dist: 2,
      left: ".R1",
      right: ".C1",
    })

  const elements = await cb.build(pb.createBuildContext())
  await logLayout("basic-schematic", elements)
  const [e1, e2] = elements.filter(
    (e) => e.type === "schematic_component"
  ) as SchematicComponent[]
  t.is(e1.center.x + e1.size.width / 2 + 2, e2.center.x - e2.size.width / 2)
})
