import { su } from "@tscircuit/soup-util"
import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("[smoke] new board test", async (t) => {
  const { pb, logSoup } = getTestFixture(t)

  const soup = await pb
    .add("board", (bb) => {
      bb.setProps({ width: "10mm", height: "10mm", pcbX: "20mm", pcbY: "5mm" })
    })
    .build()

  t.is(su(soup).pcb_board.list()[0].center.x, 20)
  t.is(su(soup).pcb_board.list()[0].center.y, 5)

  await logSoup(soup)
  t.pass()
})
