import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("basic tracehint for pad", async (t) => {
  const { logSoup, pb } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) => rb.setProps({ resistance: "10k", name: "R1" }))
    .add("trace_hint", (th) => th.setProps({ for: ".R1 .left", offset: { x: -1, y: 1 }))
    .build()

  console.log(soup)

  logSoup(soup)
})
