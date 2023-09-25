import test from "ava"
import { createProjectBuilder } from "../../src"
import { logLayout } from "../utils/log-layout"

test("custom-port-arrangement bug", async (t) => {
  const result = await createProjectBuilder()
    .add("bug", (bb) =>
      bb
        .setSourceProperties({ name: "B1" })
        .setSchematicProperties({
          port_arrangement: {
            left_side: {
              pins: [1],
            },
            bottom_side: {
              pins: [3],
            },
            right_side: {
              direction: "top-to-bottom",
              pins: [2, 4],
            },
          },
        })
        .labelPort(3, "IN")
        .labelPort(2, "OUT")
        .setSchematicCenter(8, 3)
    )
    .build()

  await logLayout(`custom-port-arrangement bug`, result)
  t.pass()
})
