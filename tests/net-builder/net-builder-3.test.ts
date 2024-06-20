import test from "ava"
import { su } from "@tscircuit/soup-util"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("net builder 3 (create multiple net labels for same net)", async (t) => {
  const { pb, logSoup } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) =>
      rb.setProps({ resistance: 100, name: "R1" }).setSchematicCenter(-2, 0)
    )
    .add("resistor", (rb) =>
      rb.setProps({ resistance: 100, name: "R2" }).setSchematicCenter(2, 0)
    )
    .add("resistor", (rb) =>
      rb
        .setProps({ resistance: 100, name: "R3", rotation: "90deg" })
        .setSchematicCenter(0, 2)
    )
    .add("resistor", (rb) =>
      rb
        .setProps({ resistance: 100, name: "R4", rotation: "-90deg" })
        .setSchematicCenter(0, -2)
    )
    .add("trace", (tb) => tb.setProps({ from: ".R1 > .right", to: "net.N1" }))
    .add("trace", (tb) => tb.setProps({ from: ".R2 > .left", to: "net.N1" }))
    .add("trace", (tb) => tb.setProps({ from: ".R3 > .left", to: "net.N1" }))
    .add("trace", (tb) => tb.setProps({ from: ".R4 > .left", to: "net.N1" }))
    .build()
  await logSoup(soup)

  const [source_net] = su(soup).source_net.list()
  if (!source_net) {
    t.fail("source net wasn't created")
  }
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
})
