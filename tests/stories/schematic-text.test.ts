import test from "ava"
import { createProjectBuilder } from "lib/builder"
import { logLayout } from "../utils/log-layout"

test("render a schematic with text", async (t) => {
  const pb = createProjectBuilder()

  const soup = await pb
    .add("component", (cb) =>
      cb.modifySchematic((scb) =>
        scb.add("schematic_text", (st) =>
          st.setProps({
            position: { x: 0, y: 0 },
            text: "Hello, World!",
          })
        )
      )
    )
    .build()

  await logLayout("custom schematic symbol with text", soup)
  t.pass()
})
