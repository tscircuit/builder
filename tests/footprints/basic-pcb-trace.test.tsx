import test from "ava"
import { getTestFixture } from "../fixtures/get-test-fixture"
import { su } from "@tscircuit/soup-util"

test("basic pcb trace (manual placement)", async (t) => {
  const { pb, logSoup } = getTestFixture(t)

  pb.add("component", (cb) => {
    cb.footprint.add("pcbtrace", (ptb) => {
      ptb.setProps({
        route: [
          { x: "0mm", y: "0mm" },
          { x: "10mm", y: "0mm" },
        ],
        thickness: "0.1mm",
      })
    })
  })

  const soup = await pb.build()

  const pcb_trace = su(soup).pcb_trace.list()[0]!

  await logSoup(soup)
  t.is(pcb_trace.route[0].x, 0)
  t.is(pcb_trace.route[1].x, 10)
})
