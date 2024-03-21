import test from "ava"
import { createFootprintBuilder, createProjectBuilder } from "../../src"
import { logLayout } from "../utils/log-layout"

test("set pcb_x/pcb_y of bug", async (t) => {
  const pb = createProjectBuilder()
  const result = await pb
    .add("bug", (bb) =>
      bb
        .setProps({
          port_arrangement: {
            left_size: 2,
            right_size: 2,
          },
          port_labels: {
            "1": "D0",
            "2": "D1",
          },
          pcb_x: 3,
          pcb_y: 0,
        })
        .setFootprint(
          createFootprintBuilder(pb).add("smtpad", (b) =>
            b.setProps({
              width: 1,
              height: 1,
              x: 0,
              y: 0,
              shape: "rect",
            })
          )
        )
    )
    .build()

  await logLayout(`pcb-shifted bug`, result)
  t.pass()
})
