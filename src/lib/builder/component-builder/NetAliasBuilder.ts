import { defineNewComponent } from "../define-new-component"
import { z } from "zod"

export const { NetAliasBuilderClass, createNetAliasBuilder } =
  defineNewComponent({
    pascal_name: "NetAlias",
    underscore_name: "net_alias",
    source_properties: z.object({
      net: z.string(),
    }),
    configurePorts(builder, ctx) {
      builder.ports.add("port", (pb) =>
        pb.setName(ctx.source_properties.net).setSchematicPosition({
          x: 0,
          y: "1mm",
        })
      )
    },
    configureSchematicSymbols(builder, ctx) {
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
            text: ctx.source_properties.net,
            anchor: "center",
            position: {
              x: 0,
              y: "-0.25mm",
            },
          })
        )
    },
  })

export type NetAliasBuilder = ReturnType<typeof createNetAliasBuilder>
