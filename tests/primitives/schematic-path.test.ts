import test from "ava"
import { createProjectBuilder } from "lib/builder"
import { logLayout } from "../utils/log-layout"

// test("render a schematic with text", async (t) => {
//   const pb = createProjectBuilder()

//   const soup = await pb
//     .add("component", (cb) =>
//       cb.modifySchematic((scb) =>
//         scb.add("schematic_text", (st) =>
//           st.setProps({
//             position: { x: 0, y: 0 },
//             text: "Hello, World!",
//           })
//         )
//       )
//     )
//     .build()

//   await logLayout("custom schematic symbol with text", soup)
//   t.pass()
// })

test("render a simple schematic path", async (t) => {
  const soup = await createProjectBuilder().add("component", (cb) =>
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
})
