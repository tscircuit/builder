import test from "ava"
import { getTestFixture } from "../fixtures/get-test-fixture"
import { su } from "@tscircuit/soup-util"

test("replicate duplicate port hints issue", async (t) => {
  const { logSoup, pb } = await getTestFixture(t)

  const soup = await pb
    .add("bug", (cb) => {
      cb.setProps({ footprint: "soic8" })
    })
    .build()

  const sourcePorts = su(soup).source_port.list()

  sourcePorts.forEach((port) => {
    if (port.port_hints) {
      const portHintsSet = new Set(port.port_hints)

      t.is(
        port.port_hints.length,
        portHintsSet.size,
        `Duplicate hints found in port ${port.name}`
      )
    } else {
      t.fail(`port_hints is undefined for port ${port.name}`)
    }
  })

  await logSoup(soup)
})
