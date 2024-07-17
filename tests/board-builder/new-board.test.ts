import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("[smoke] new board test", async (t) => {
  const { pb, logSoup } = getTestFixture(t)

  const soup = await pb
    .add("board", (bb) => {
      bb.setProps({ width: 10, height: 10, pcbX: 20, pcbY: 0 })
    })
    .build()

  await logSoup(soup)
  t.pass()
})