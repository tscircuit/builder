import { BuildContext } from "lib/types"
import { defineNewComponent } from "../define-new-component"
import { z } from "zod"
import { BaseComponentBuilder } from "./ComponentBuilder"
import { createPortBuilder } from "../ports-builder"

const config = {
  pascal_name: "NetAlias",
  underscore_name: "net_alias",
  source_properties: z.object({
    net: z.string(),
  }),
  configurePorts: (builder: BaseComponentBuilder<any>) => {},
} as const

export const { NetAliasBuilderClass, createNetAliasBuilder } =
  defineNewComponent(config)

export type NetAliasBuilder = ReturnType<typeof createNetAliasBuilder>
