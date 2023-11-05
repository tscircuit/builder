import test from "ava"
import { createProjectBuilder } from "../../src"
import { logLayout } from "../utils/log-layout"

test("bug that has a footprint and connects to a resistor", async (t) => {
  const result = await createProjectBuilder()
    .add("bug", (bb) =>
      bb
        .setSourceProperties({ name: "B1" })
        .setSchematicProperties({
          port_arrangement: {
            left_size: 3,
            right_size: 3,
          },
        })
        .setFootprint("sot236")
        .labelPort(1, "D0")
        .labelPort(2, "D1")
        .setSchematicCenter(0, 0)
    )
    .add("resistor", (bb) =>
      bb
        .setSourceProperties({ name: "R1" })
        .setFootprint("0805")
        .setFootprintCenter(-4, 0)
        .setSchematicCenter(-2, -0.5)
    )
    .add("trace", (tb) => tb.addConnections([".B1 > .D0", ".R1 > .right"]))
    .build()

  const d0_port = result.find((elm) => {
    if (elm.type !== "pcb_port") return false
    if (!elm.source_port_id) return false
    const elm_source = result.find(
      (e2) =>
        e2.source_port_id === elm.source_port_id && e2.type === "source_port"
    )
    if (elm_source && elm_source.name === "D0") return true
    return false
  })

  t.truthy(d0_port.x)
  t.truthy(d0_port.y)

  await logLayout(`bug connected to resistor`, result)
  t.pass()
})
