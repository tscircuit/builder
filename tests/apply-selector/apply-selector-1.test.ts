import * as Type from "lib/types"
import test from "ava"
import { createProjectBuilder, ProjectClass } from "lib/project"
import { applySelector } from "lib/apply-selector"

test("applySelector use css selector to select circuit elements", async (t) => {
  const elements = await createProjectBuilder()
    .add("group", (gb) =>
      gb
        .addResistor((cb) =>
          cb.setSourceProperties({
            resistance: "10 ohm",
            name: "R1",
          })
        )
        .addCapacitor((cb) =>
          cb.setSourceProperties({
            name: "C1",
            capacitance: "10 uF",
          })
        )
    )
    .build()

  const selector = ".R1 > port.right"

  t.deepEqual(applySelector(elements, selector), [
    {
      type: "source_port",
      name: "right",
      pin_number: undefined,
      port_hints: undefined,
      source_port_id: "source_port_1",
      source_component_id: "simple_resistor_0",
    },
  ])
})
