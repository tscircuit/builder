import type * as builder from "lib/builder"

export type Builder =
  | builder.ComponentBuilder
  | builder.FootprintBuilder
  | builder.GroupBuilder
  | builder.PortsBuilder
  | builder.PortBuilder
  | builder.ProjectBuilder
  | builder.SMTPadBuilder
  | builder.TraceBuilder
  | builder.SchematicSymbolBuilder
  | builder.SchematicSymbolPrimitiveBuilder

export type BuilderType = builder.ComponentBuilder["builder_type"]
