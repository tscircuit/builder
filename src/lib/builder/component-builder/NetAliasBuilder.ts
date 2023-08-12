import { defineNewComponent } from "../define-new-component"
import { z } from "zod"

const config = {
  pascal_name: "NetAlias",
  underscore_name: "net_alias",
  source_properties: z.object({
    net: z.string(),
  }),
} as const

export const { NetAliasBuilderClass, createNetAliasBuilder } =
  defineNewComponent(config)

export type NetAliasBuilder = ReturnType<typeof createNetAliasBuilder>

export type SourceProperties = Parameters<
  NetAliasBuilder["setSourceProperties"]
>[0]
