import { SchematicBoxBuilder } from "./schematic-box-builder"
import { SchematicLineBuilder } from "./schematic-line-builder"
import { SchematicPathBuilder } from "./schematic-path-builder"
import { SchematicTextBuilder } from "./schematic-text-builder"

export * from "./schematic-symbol-builder"
export * from "./schematic-box-builder"
export * from "./schematic-line-builder"
export * from "./schematic-text-builder"
export * from "./schematic-path-builder"

export type SchematicSymbolPrimitiveBuilder =
  | SchematicBoxBuilder
  | SchematicLineBuilder
  | SchematicTextBuilder
  | SchematicPathBuilder
