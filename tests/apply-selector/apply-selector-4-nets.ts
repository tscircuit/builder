import * as Type from "lib/types"
import test from "ava"
import { createProjectBuilder, ProjectClass } from "lib/project"
import { applySelector } from "lib/apply-selector"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("applySelector 4: nets", async (t) => {
  const { pb, logSoup } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) => rb.setProps({ resistance: 100, name: "R1" }))
    .add("net", (nb) => nb.setProps({ name: "N1" }))
    .add("trace", (tb) => tb.setProps({ from: ".R1 > .right", to: "net.N1" }))
    .build()

  t.like(applySelector(soup, ".N1")[0], {
    type: "source_net",
    name: "N1",
  })
  t.like(applySelector(soup, "net.N1")[0], {
    type: "source_net",
    name: "N1",
  })
})
