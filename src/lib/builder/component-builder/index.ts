import type { TraceBuilder } from "../trace-builder"
import type { BugBuilder } from "./BugBuilder"
import type { CapacitorBuilder } from "./CapacitorBuilder"
import type { GenericComponentBuilder } from "./ComponentBuilder"
import type { DiodeBuilder } from "./DiodeBuilder"
import type { GroundBuilder } from "./GroundBuilder"
import type { InductorBuilder } from "./InductorBuilder"
import type { LedBuilder } from "./LedBuilder"
import type { NetAliasBuilder } from "./NetAliasBuilder"
import type { PowerSourceBuilder } from "./PowerSourceBuilder"
import type { ResistorBuilder } from "./ResistorBuilder"
import type { ViaBuilder } from "./ViaBuilder"

export * from "./BugBuilder"
export * from "./CapacitorBuilder"
export * from "./ComponentBuilder"
export * from "./DiodeBuilder"
export * from "./GroundBuilder"
export * from "./InductorBuilder"
export * from "./LedBuilder"
export * from "./NetAliasBuilder"
export * from "./PowerSourceBuilder"
export * from "./ResistorBuilder"
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
