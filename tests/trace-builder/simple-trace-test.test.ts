import { su } from "@tscircuit/soup-util"
import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("simple trace test", async (t) => {
  const { logSoup, pb } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) =>
      rb.setProps({
        resistance: "10 ohm",
        name: "R1",
        footprint: "0805",
        pcbX: -5,
        pcbY: 0,
      })
    )
    .add("resistor", (rb) =>
      rb.setProps({
        resistance: "10 ohm",
        name: "R2",
        footprint: "0805",
        pcbX: 5,
        pcbY: 0,
      })
    )
    .add("trace", (tb) =>
      tb.setProps({
        from: ".R1 > .right",
        to: ".R2 > .left",
      })
    )
    .build()

  const traces = su(soup).pcb_trace.list()
  const startTrace = traces[0]
  t.is(
    startTrace.route.some(
      (r) => r.route_type === "wire" && r.start_pcb_port_id !== undefined
    ),
    true
  )

  const endTrace = traces[traces.length - 1]
  t.is(
    endTrace.route.some(
      (r) => r.route_type === "wire" && r.start_pcb_port_id !== undefined
    ),
    true
  )

  await logSoup(soup)
  t.pass()
})
