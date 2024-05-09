import test from "ava"
import { su } from "@tscircuit/soup-util"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("net builder 1", async (t) => {
  const { pb, logSoup } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) => rb.setProps({ resistance: 100, name: "R1" }))
    .add("net", (nb) => nb.setProps({ name: "N1" }))
    .add("trace", (tb) => tb.setProps({ from: ".R1 > .right", to: ".N1" }))
    .build()

  const [source_net] = su(soup).source_net.list()
  t.is(source_net.name, "N1")

  logSoup(soup)
})
