import test from "ava"
import { su } from "@tscircuit/soup-util"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("basic tracehint for pad", async (t) => {
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
  // const pcb_port = su(soup).pcb_port.getWhere({ source_port_id })

  logSoup(soup)
})
