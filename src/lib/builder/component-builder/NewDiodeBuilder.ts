import { defineNewComponent } from "../define-new-component"
import { z } from "zod"

export const { DiodeBuilderClass, createDiodeBuilder } = defineNewComponent({
  pascal_name: "Diode",
  underscore_name: "diode",
  source_properties: z.object({}),
  configurePorts(builder, ctx) {
    builder.ports
      .add("port", (pb) =>
        pb.setName("left").setSchematicPosition({ x: -0.5, y: 0 })
      )
      .add("port", (pb) =>
        pb.setName("right").setSchematicPosition({ x: -0.5, y: 0 })
      )
  },
  configureSchematicSymbols(builder, ctx) {
    // { stroke: "red", strokeWidth: 2, d: "M 0,0 H 21" },
    // { stroke: "red", strokeWidth: 2, d: "M 49,0 H 59" },
    // { stroke: "red", strokeWidth: 2, d: "M 49,0 L 21 14 V -14 Z" },
    // { stroke: "red", strokeWidth: 2, d: "M 49,-14 V 14" },
    builder.schematic_symbol
      .add("schematic_line", (sb) =>
        sb.setProps({
          x1: "-2mm",
          y1: 0,
          x2: "2mm",
          y2: 0,
        })
      )
      .add("schematic_line", (sb) =>
        sb.setProps({
          x1: 0,
          y1: 0,
          x2: 0,
          y2: "1mm",
        })
      )
      .add("schematic_text", (stb) =>
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

export type NetAliasBuilder = ReturnType<typeof createDiodeBuilder>
