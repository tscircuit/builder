import test from "ava"
import { su } from "@tscircuit/soup-util"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("trace hint 2: pcb trace follows trace hint", async (t) => {
  const { logSoup, pb } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) =>
      rb.setProps({
        resistance: "10k",
        name: "R1",
        footprint: "0805",
        pcb_x: -5,
        pcb_y: 0,
      })
    )
    .add("resistor", (rb) =>
      rb.setProps({
        resistance: "10k",
        name: "R2",
        footprint: "0805",
        pcb_x: 5,
        pcb_y: 0,
      })
    )
    .add("trace_hint", (th) =>
      th.setProps({
        for: ".R1 > .left",
        offset: { x: -5, y: 5 },
      })
    )
    .add("trace", (tb) =>
      tb.setProps({
        from: ".R1 > .left",
        to: ".R2 > .right",
      })
    )
    .build()

  const trace_hints = su(soup).pcb_trace_hint.list({})!

  t.is(trace_hints.length, 1)

  const trace_hint = trace_hints[0]

  // waiting for select
  const pcb_port = su(soup).pcb_port.select(".R1 > .left")!

  // check that the trace goes up to y=5 for the trace hint before coming
  // back down to connect to the other resistor
  const route = su(soup).pcb_trace.list({})[0].route
  t.truthy(route.some((e) => e.y === 5))

  await logSoup(soup)
})
