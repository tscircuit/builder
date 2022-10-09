import * as builder from "lib/builder"

export type Builder =
  | builder.ComponentBuilder
  | builder.FootprintBuilder
  | builder.GroupBuilder
  | builder.PortsBuilder
  | builder.PortBuilder
  | builder.ProjectBuilder
  | builder.SMTPadBuilder
  | builder.TraceBuilder

export type BuilderType = builder.ComponentBuilder["builder_type"]
