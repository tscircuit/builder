import test from "ava"
import { createConstrainedLayoutBuilder, createProjectBuilder } from "../src"

test("constraint builder test", async (t) => {
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
    .addConstraint({ type: "xdist", dist: 10, a: "R1", b: "C1" })

  const elements = await cb.build()
  console.log(elements)
})
