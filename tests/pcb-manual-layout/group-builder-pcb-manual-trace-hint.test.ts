import { getTestFixture } from "tests/fixtures/get-test-fixture"
import test from "ava"
import { layout } from "@tscircuit/layout"
import { PCBComponent, manual_layout } from "index"
import { su } from "@tscircuit/soup-util"

test("pcb trace hint in group builder", async (t) => {
  const { logSoup, pb } = getTestFixture(t)

  const soup = await pb
    .setProps({
      layout: layout().manualEdits({
        manual_trace_hints: [
          {
            pcb_port_selector: ".R1 > .right",
            offsets: [
              {
                x: 0,
                y: 10,
              },
            ],
          },
        ],
      }),
    })
    .add("resistor", (rb) =>
      rb.setProps({
        resistance: "10k",
        name: "R1",
        footprint: "0805",
      })
    )
    .add("resistor", (rb) =>
      rb
        .setProps({
          resistance: "10k",
          name: "R2",
          footprint: "0805",
        })
        .setFootprintCenter(3, 0)
    )
    .add("trace", (tb) =>
      tb.setProps({
        from: ".R1 > .right",
        to: ".R2 > .left",
      })
    )
    .build()

  const ths = su(soup).pcb_trace_hint.list()

  const trace = su(soup).pcb_trace.list()[0]

  t.is(ths.length, 1)
  t.truthy(trace.route.some((r) => r.y === 10))
})
