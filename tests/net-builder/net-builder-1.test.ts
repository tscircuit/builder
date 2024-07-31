import test from "ava"
import { su } from "@tscircuit/soup-util"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("net builder 1", async (t) => {
  const { pb, logSoup, writePcbSnapshotPng } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) => rb.setProps({ resistance: 100, name: "R1" }))
    .add("net", (nb) => nb.setProps({ name: "N1", trace_width: 0.2 }))
    .add("trace", (tb) => tb.setProps({ from: ".R1 > .right", to: "net.N1" }))
    .build()

  const [source_net] = su(soup).source_net.list()
  t.is(source_net.name, "N1")

  const errors = soup.filter((e) => e.type.includes("_error"))

  if (errors.length > 0) {
    console.log(errors)
  }
  t.is(errors.length, 0)

  const [net_label] = su(soup).schematic_net_label.list()

  t.truthy(net_label)

  const [trace] = su(soup).schematic_trace.list()

  t.truthy(trace)

  await writePcbSnapshotPng(soup)
  await logSoup(soup)
})
