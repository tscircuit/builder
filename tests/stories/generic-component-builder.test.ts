import test from "ava"
import {
  createBoxBuilder,
  createPlatedHoleBuilder,
  createPortBuilder,
  createProjectBuilder,
  createSchematicLineBuilder,
  createSchematicSymbolBuilder,
  PortBuilder,
} from "lib/builder"
import { logLayout } from "../utils/log-layout"

test("component build from scratch without .add function (only appendChild)", async (t) => {
  const pb = await createProjectBuilder()

  const pins = ["rx", "tx", "d2"]

  pb.add("component", (cb) => {
    cb.setName("PIN3")
    const port_map: Record<string, PortBuilder> = {}
    for (let i = 0; i < pins.length; i++) {
      const pin = pins[i]
      const phb = createPlatedHoleBuilder(pb).setProps({
        // net: pin,
        x: `${i * 2.5}mm`,
        y: 0,
        outer_diameter: "2mm",
        hole_diameter: "1mm",
      })
      cb.appendChild(phb)

      const portb = createPortBuilder(pb)
      port_map[pin] = portb
      cb.appendChild(portb)
    }
    // Symbol
    const ssb = createSchematicSymbolBuilder(pb)

    const box = createBoxBuilder(pb).setProps({
      width: "0.1in",
      height: "0.3in",
      x: 0,
      y: 0,
    })
    ssb.appendChild(box)

    for (let i = 0; i < pins.length; i++) {
      const pin = pins[i]
      const y1 = `${(0.3 / 3) * i - 0.1}in` as const
      const slb = createSchematicLineBuilder(pb).setProps({
        x1: "0.04in",
        y1,
        x2: "0.07in",
        y2: y1,
      })
      ssb.appendChild(slb)
      const portb = port_map[pin]
      portb.schematic_position = {
        x: "0.07in",
        y: y1,
      }
    }

    cb.appendChild(ssb)
  })

  await logLayout("generic-component-builder", await pb.build())

  t.snapshot(await pb.build(), "Generic Component Builder Output")
})
