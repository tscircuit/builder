import test from "ava"
import { su } from "@tscircuit/soup-util"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("net builder 1", async (t) => {
  const { pb, logSoup } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) => rb.setProps({ resistance: 100, name: "R1" }))
    .add("net", (nb) => nb.setProps({ name: "N1" }))
    .add("trace", (tb) => tb.setProps({ from: ".R1 > .right", to: "net.N1" }))
    .build()

  const [source_net] = su(soup as any).source_net.list()
  t.is(source_net.name, "N1")

  const errors = soup.filter((e) => e.type.includes("_error"))

  if (errors.length > 0) {
    console.log(errors)
  }
  t.is(errors.length, 0)

  const [net_label] = su(soup as any).schematic_net_label.list()

  t.truthy(net_label)

  await logSoup(soup)
})
