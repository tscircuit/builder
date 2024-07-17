import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("[smoke] board builder", async (t) => {
  const { pb, logSoup } = getTestFixture(t)

  const soup = await pb
    .add("board", (bb) => {
      bb.setProps({ width: 100, height: 100, pcbX: 0, pcbY: 0 })
    })
    .build()

  await logSoup(soup)
  t.pass()
})
