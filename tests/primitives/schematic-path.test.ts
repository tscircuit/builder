import test from "ava"
import { createProjectBuilder } from "lib/builder"
import { logLayout } from "../utils/log-layout"

test("render a simple schematic path", async (t) => {
  const soup = await createProjectBuilder()
    .add("component", (cb) =>
      cb.modifySchematic((sb) =>
        sb.add("schematic_path", (sp) =>
          sp.setProps({
            points: [
              { x: 0, y: 0 },
              { x: 100, y: 100 },
            ],
          })
        )
      )
    )
    .build()

  await logLayout("custom schematic symbol with path", soup)
  t.pass()
})
