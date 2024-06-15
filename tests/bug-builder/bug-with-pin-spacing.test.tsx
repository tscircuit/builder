import test from "ava"
import { getTestFixture } from "../fixtures/get-test-fixture"

test("bug with pin spacing", async (t) => {
  const { logSoup, pb } = await getTestFixture(t)

  const soup = await pb
    .add("bug", (bb) =>
      bb.setProps({
        name: "B1",
        schPortArrangement: {
          leftSize: 0,
          rightSize: 4,
        },
        pinLabels: {
          1: "D0",
          2: "D1",
        },
        pinSpacing: 1,
        center: { x: 0, y: 0 },
      })
    )
    .build()

  await logSoup(soup)
  t.pass()
})
