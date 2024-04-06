import { TraceBuilder } from "../trace-builder"
import { BugBuilder } from "./BugBuilder"
import { CapacitorBuilder } from "./CapacitorBuilder"
import { GenericComponentBuilder } from "./ComponentBuilder"
import { DiodeBuilder } from "./NewDiodeBuilder"
import { GroundBuilder } from "./GroundBuilder"
import { InductorBuilder } from "./InductorBuilder"
import { NetAliasBuilder } from "./NetAliasBuilder"
import { PowerSourceBuilder } from "./PowerSourceBuilder"
import { ResistorBuilder } from "./ResistorBuilder"
import { ViaBuilder } from "./ViaBuilder"

export * from "./ComponentBuilder"
export * from "./ResistorBuilder"
export * from "./CapacitorBuilder"
export * from "./InductorBuilder"
export * from "./BugBuilder"
export * from "./NewDiodeBuilder"
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
