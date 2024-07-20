import test from "ava"
import { su } from "@tscircuit/soup-util"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("[smoke] board builder", async (t) => {
  const { pb, logSoup } = getTestFixture(t)

  const soup = await pb
    .add("board", (bb) => {
      bb.setProps({ width: 100, height: 100, pcbX: 10, pcbY: 5 })
    })
    .build()

  const [pcb_board] = su(soup).pcb_board.list()
  t.is(pcb_board.center.x, 10)
  t.is(pcb_board.center.y, 5)
  await logSoup(soup)
  t.pass()
})
