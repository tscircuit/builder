import type { PCBConfig, SchematicConfig, SourceConfig } from "lib/types/index"

export const defaultSchematicConfig: SchematicConfig = {
  type: "schematic_config",
}

export const defaultPCBConfig: PCBConfig = {
  type: "pcb_config",
  dimension_unit: "mm",
}

export const defaultSourceConfig: SourceConfig = {
  type: "source_config",
}
