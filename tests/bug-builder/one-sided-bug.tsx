import test from "ava"
import { createProjectBuilder } from "../../src"
import { logLayout } from "../utils/log-layout"

test("one-sided bug", async (t) => {
  const result = await createProjectBuilder()
    .add("bug", (bb) =>
      bb
        .setSourceProperties({ name: "B1" })
        .setSchematicProperties({
          port_arrangement: {
            left_size: 0,
            right_size: 4,
          },
        })
        .labelPort(1, "D0")
        .labelPort(2, "D1")
        .setSchematicCenter(8, 3)
    )
    .build()

  await logLayout(`one-sided bug`, result)
  t.pass()
})
