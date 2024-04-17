import test from "ava"
import { convertSoupToExcellonDrillCommands } from "lib/excellon-drill/convert-soup-to-excellon-drill-commands"
import { stringifyExcellonDrill } from "lib/excellon-drill/stringify-excellon-drill"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("generate excellon drill text from axial resistor", async (t) => {
  const { logSoup, pb } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) =>
      rb.modifyFootprint((fb) =>
        fb
          .add("platedhole", (phb) =>
            phb.setProps({
              hole_diameter: "0.0394in",
              outer_diameter: "0.05in",
              x: 0,
              y: 0,
            })
          )
          .add("platedhole", (phb) =>
            phb.setProps({
              hole_diameter: "0.0394in",
              outer_diameter: "0.05in",
              x: "0.3in",
              y: 0,
            })
          )
          .add("pcb_via", (pv) =>
            pv.setProps({
              hole_diameter: "0.05in",
              x: "0.6in",
              y: 0,
              layers: ["top", "bottom"],
            })
          )
      )
    )
    .build()

  await logSoup(soup)

  const excellon_drill_cmds = convertSoupToExcellonDrillCommands({
    soup: soup as any,
    is_plated: true,
  })

  const excellon_drill_file_content =
    stringifyExcellonDrill(excellon_drill_cmds)

  t.truthy(excellon_drill_file_content.includes("X0.3000Y0.0000"))
  t.truthy(excellon_drill_file_content.includes("T11C0.050000"))
})
