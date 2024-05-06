import test from "ava"
import { su } from "@tscircuit/soup-util"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("trace hint 1: basic trace_hint for pad", async (t) => {
  const { logSoup, pb } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) =>
      rb.setProps({ resistance: "10k", name: "R1", footprint: "0805" })
    )
    .add("trace_hint", (th) =>
      th.setProps({
        for: ".R1 > .left",
        offset: { x: -1, y: 1 },
      })
    )
    .build()

  const trace_hints = su(soup).pcb_trace_hint.list({})!

  t.is(trace_hints.length, 1)

  const trace_hint = trace_hints[0]

  // waiting for select
  const pcb_port = su(soup).pcb_port.select(".R1 > .left")!

  t.is(trace_hint.route[0].x, pcb_port.x - 1)
  t.is(trace_hint.route[0].y, pcb_port.y + 1)

  logSoup(soup)
})
