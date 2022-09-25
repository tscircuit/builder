import { TraceBuilder } from "../trace-builder"
import { BugBuilder } from "./BugBuilder"
import { CapacitorBuilder } from "./CapacitorBuilder"
import { GenericComponentBuilder } from "./ComponentBuilder"
import { DiodeBuilder } from "./DiodeBuilder"
import { GroundBuilder } from "./GroundBuilder"
import { InductorBuilder } from "./InductorBuilder"
import { PowerSourceBuilder } from "./PowerSourceBuilder"
import { ResistorBuilder } from "./ResistorBuilder"

export * from "./ComponentBuilder"
export * from "./ResistorBuilder"
export * from "./CapacitorBuilder"
export * from "./InductorBuilder"
export * from "./BugBuilder"
export * from "./DiodeBuilder"
export * from "./PowerSourceBuilder"
export * from "./GroundBuilder"

export type ComponentBuilder =
  | GenericComponentBuilder
  | ResistorBuilder
  | CapacitorBuilder
  | InductorBuilder
  | BugBuilder
  | DiodeBuilder
  | PowerSourceBuilder
  | GroundBuilder
  | TraceBuilder
