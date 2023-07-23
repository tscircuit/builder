import test from "ava"
import { createProjectBuilder } from "../../src"
import { logLayout } from "../utils/log-layout"

test("three-sided bug", async (t) => {
  const result = await createProjectBuilder()
    .add("bug", (bb) =>
      bb
        .setSourceProperties({ name: "B1" })
        .setSchematicProperties({
          port_arrangement: {
            left_size: 3,
            right_size: 3,
            top_size: 0,
            bottom_size: 5,
          },
        })
        .labelPort(1, "D0")
        .labelPort(2, "D1")
        .setSchematicCenter(8, 3)
    )
    .build()

  await logLayout(`three-sided bug`, result)
  t.pass()
})
