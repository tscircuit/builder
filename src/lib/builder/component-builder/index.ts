import { TraceBuilder } from "../trace-builder"
import { BugBuilder } from "./BugBuilder"
import { CapacitorBuilder } from "./CapacitorBuilder"
import { GenericComponentBuilder } from "./ComponentBuilder"
import { DiodeBuilder } from "./DiodeBuilder"
import { GroundBuilder } from "./GroundBuilder"
import { InductorBuilder } from "./InductorBuilder"
import { LedBuilder } from "./LedBuilder"
import { NetAliasBuilder } from "./NetAliasBuilder"
import { PowerSourceBuilder } from "./PowerSourceBuilder"
import { ResistorBuilder } from "./ResistorBuilder"
import { ViaBuilder } from "./ViaBuilder"

export * from "./ComponentBuilder"
export * from "./ResistorBuilder"
export * from "./CapacitorBuilder"
export * from "./InductorBuilder"
export * from "./BugBuilder"
export * from "./DiodeBuilder"
export * from "./LedBuilder"
export * from "./PowerSourceBuilder"
export * from "./GroundBuilder"
export * from "./NetAliasBuilder"
export * from "./ViaBuilder"

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
  | NetAliasBuilder
  | ViaBuilder
  | LedBuilder
