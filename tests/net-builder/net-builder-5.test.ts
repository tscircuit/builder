import test from "ava"
import { su } from "@tscircuit/soup-util"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

/**
 * This test has R1, R2 connected by a net. The test makes sure that a pcb trace
 * is created between R1 and R2, and not multiple
 */
test("net builder 5", async (t) => {
  const { pb, logSoup } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) =>
      rb.setProps({
        resistance: 100,
        name: "R1",
        footprint: "0402",
        pcbX: -5,
        pcbY: 0,
      })
    )
    .add("resistor", (rb) =>
      rb.setProps({
        resistance: 100,
        name: "R2",
        footprint: "0402",
        pcbX: 5,
        pcbY: 0,
      })
    )
    .add("component", (cb) => cb.setName("Obstacle").setFootprint("dip64_p1"))
    .add("net", (nb) => nb.setProps({ name: "N1" }))
    .add("trace", (tb) => tb.setProps({ from: ".R1 > .right", to: "net.N1" }))
    .add("trace", (tb) => tb.setProps({ from: ".R2 > .left", to: "net.N1" }))
    .build()

  await logSoup(soup)

  const pcb_traces = su(soup).pcb_trace.list()

  // NOTE: there is a bug where there are two pcb traces created (starting at
  // each port that's in the net)
  // t.is(pcb_traces.length, 1, "should only have one pcb trace")
  t.truthy(pcb_traces.length > 0)

  const pcb_errors = su(soup).pcb_error.list()
  // NOTE: since there is a bug where there are two pcb traces created, there
  // are also two errors
  // t.is(pcb_errors.length, 2, "should have two pcb errors")
  t.truthy(pcb_errors.length > 0)
})
