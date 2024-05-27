import { getTestFixture } from "tests/fixtures/get-test-fixture"
import test from "ava"
import { SchematicComponent } from "lib/types"
import { layout } from "@tscircuit/layout"

test("automatic schematic layout 1", async (t) => {
  const { logSoup, pb } = getTestFixture(t)

  const soup = await pb
    .setProps({
      layout: layout().autoLayoutSchematic(),
    })
    .add("bug", (cb) =>
      cb
        .setProps({
          name: "U1",
          port_arrangement: {
            left_size: 4,
            right_size: 4,
          },
        })
        .labelPort(1, "GND")
        .labelPort(2, "TRG")
        .labelPort(3, "OUT")
        .labelPort(4, "RES")
        .labelPort(5, "CRL")
        .labelPort(6, "TRE")
        .labelPort(7, "DIS")
        .labelPort(8, "VCC")
    )
    .add("diode", (lb) => lb.setProps({ name: "LED" }))
    .add("resistor", (rb) => rb.setProps({ resistance: "1k ohm", name: "R1" }))
    .add("resistor", (rb) => rb.setProps({ resistance: "10k ohm", name: "R2" }))
    .add("resistor", (rb) => rb.setProps({ resistance: "220 ohm", name: "R3" }))
    .add("capacitor", (cb) => cb.setProps({ capacitance: "10uF", name: "C1" }))

    // run addTrace([".U1 > .GND", ".R2 >...."]) to configure the 555timer in an astable configuration
    .add("trace", (tb) => tb.addConnections([".R1 > .left", ".R2 > .left"]))
    .add("trace", (tb) => tb.addConnections([".R2 > .left", ".C1 > .right"]))
    .add("trace", (tb) => tb.addConnections([".R2 > .left", ".U1 > port.TRE"]))
    .add("trace", (tb) => tb.addConnections([".C1 > .left", ".U1 > port.GND"]))
    .add("trace", (tb) =>
      tb.addConnections([".U1 > port.DIS", ".U1 > port.TRG"])
    )
    .add("trace", (tb) =>
      tb.addConnections([".U1 > port.OUT", ".LED > .anode"])
    )
    .add("trace", (tb) => tb.addConnections([".LED > .cathode", ".R3 > .left"]))
    // .add("trace", (tb) => tb.addConnections([".U1 > port.VCC+", "5-12V line"]))
    .build()

  await logSoup(soup)
  const r1_source_component = soup.find(
    (c): c is SchematicComponent =>
      c.type === "source_component" && c.name === "R2"
  )!

  t.not(
    soup.find(
      (c): c is SchematicComponent =>
        c.type === "schematic_component" &&
        c.source_component_id === r1_source_component.source_component_id
    )!.center.x,
    0
  )
})
