import { defineNewComponent } from "../define-new-component"
import { z } from "zod"

export const { DiodeBuilderClass, createDiodeBuilder } = defineNewComponent({
  pascal_name: "Diode",
  underscore_name: "diode",
  source_properties: z.object({
    ftype: z.literal("simple_diode").default("simple_diode"),
  }),
  schematic_properties: z.object({}),
  pcb_properties: z.object({}),
  configurePorts(builder, ctx) {
    builder.ports
      .add("port", (pb) =>
        pb
          .setName("left")
          .setSchematicPosition({ x: -0.5, y: 0 })
          .setPinNumber(1)
          .setSchematicPinNumberVisible(false)
          .setSchematicDirection("left")
      )
      .add("port", (pb) =>
        pb
          .setName("right")
          .setSchematicPosition({ x: 0.5, y: 0 })
          .setPinNumber(2)
          .setSchematicPinNumberVisible(false)
          .setSchematicDirection("right")
      )
  },
  configureSchematicSymbols(builder, ctx) {
    // { stroke: "red", strokeWidth: 2, d: "M 0,0 H 21" },
    // { stroke: "red", strokeWidth: 2, d: "M 49,0 H 59" },
    // { stroke: "red", strokeWidth: 2, d: "M 49,0 L 21 14 V -14 Z" },
    // { stroke: "red", strokeWidth: 2, d: "M 49,-14 V 14" },

    // scaled to be 1mm wide

    // Horizontal start and end line
    // M 0 0 H 0.3443
    // M 0.8033 0 H 0.9672

    // triangle
    // M 0.8033 0 L 0.3443 0.2295 V -0.2295 Z

    // Vertical line
    // M 0.8033 -0.2295 V 0.2295

    const h1 = { x1: 0, y1: 0, x2: 0.3443, y2: 0 }
    const h2 = { x1: 0.8033, y1: 0, x2: 1, y2: 0 }

    const t1 = { x1: 0.8033, y1: 0, x2: 0.3443, y2: 0.2295 }
    const t2 = { x1: 0.3443, y1: 0.2295, x2: 0.3443, y2: -0.2295 }
    const t3 = { x1: 0.3443, y1: -0.2295, x2: 0.8033, y2: 0 }

    const v1 = { x1: 0.8033, y1: -0.2295, x2: 0.8033, y2: 0.2295 }

    const lines = [h1, h2, t1, t2, t3, v1]

    for (const line of lines) {
      builder.schematic_symbol.add(
        "schematic_line",
        (sb) =>
          sb.setProps({
            x1: line.x1 - 0.5,
            y1: line.y1,
            x2: line.x2 - 0.5,
            y2: line.y2,
          })
        // sb.setProps({
        //   x1: `${line.x1}mm`,
        //   y1: `${line.y1}mm`,
        //   x2: `${line.x2}mm`,
        //   y2: `${line.y2}mm`,
        // })
      )
    }

    builder.schematic_symbol.add("schematic_text", (stb) =>
      stb.setProps({
        text: ctx.source_properties.name,
        anchor: "center",
        position: {
          x: 0,
          y: "-0.25mm",
        },
      })
    )
  },
})

export type DiodeBuilder = ReturnType<typeof createDiodeBuilder>

// Added for legacy compat
export type DiodeBuilderCallback = (rb: DiodeBuilder) => unknown
