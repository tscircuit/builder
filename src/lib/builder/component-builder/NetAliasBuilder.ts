import { defineNewComponent } from "../define-new-component"
import { z } from "zod"

export const { NetAliasBuilderClass, createNetAliasBuilder } =
  defineNewComponent({
    pascal_name: "NetAlias",
    underscore_name: "net_alias",
    source_properties: z.object({
      net: z.string(),
    }),
    configurePorts: (builder, ctx) => {
      console.log("ports built")
      builder.ports.add("port", (pb) =>
        pb.setName(ctx.source_properties.net).setSchematicPosition({
          x: 0,
          y: 0,
        })
      )
    },
  } as const)

export type NetAliasBuilder = ReturnType<typeof createNetAliasBuilder>
