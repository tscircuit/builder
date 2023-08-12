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
          y: 0,
        })
      )
    },
    configureSchematicSymbols(builder, ctx) {
      builder.schematic_symbol.add("schematic_box", (sb) =>
        sb.setProps({
          x: 0,
          y: 0,
          width: "4mm",
          height: "4mm",
        })
      )
      // .add("schematic_text", (stb) =>
      //   stb.setProps({
      //     text: ctx.source_properties.net,
      //   })
      // )
    },
  } as const)

export type NetAliasBuilder = ReturnType<typeof createNetAliasBuilder>
