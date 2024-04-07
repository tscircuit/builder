import * as Type from "lib/types"
import test from "ava"
import { createProjectBuilder, ProjectClass } from "lib/project"
import { applySelector } from "lib/apply-selector"

test.skip("applySelector should work to resolve via layer ambiguity", async (t) => {
  const elements = await createProjectBuilder()
    .add("group", (gb) =>
      gb
        .addResistor((cb) =>
          cb.setSourceProperties({
            resistance: "10 ohm",
            name: "R1",
          })
        )
        .add("via", (vb) =>
          vb.setProps({
            pcb_x: "1mm",
            pcb_y: "1mm",
            hole_diameter: "0.5mm",
            outer_diameter: "1mm",
          })
        )
    )
    .build()

  const selector = ".V1"

  // We should select for via.top or whatever using the layer of R1 to determine
  // if we're connecting to e.g. top or bottom

  // t.deepEqual(applySelector(elements, selector), [
  //   {
  //     type: "source_port",
  //     name: "right",
  //     pin_number: undefined,
  //     source_port_id: "source_port_1",
  //     source_component_id: "simple_resistor_0",
  //   },
  // ])
})
