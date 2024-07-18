import type * as Soup from "@tscircuit/soup"
import type { AnySoupElement, LayerRef } from "@tscircuit/soup"
import type { SourceComponent } from "./source-component"

export interface SchematicConfig {
  type: "schematic_config"
}

type Point = Soup.Point
type Size = Soup.Size

export interface SourceConfig {
  type: "source_config"
}

export interface SchematicGroup {
  type: "schematic_group"
  schematic_group_id: string
  source_group_id: string
  center: Point
  size: Size
  children_schematic_component_ids: string[]
  children_schematic_trace_ids: string[]
}

export type SchematicDrawing = Soup.SchematicBox | Soup.SchematicLine
// TODO this text type seems redundant with schematic_text...
// It's attached to the symbol, so probably shouldn't be used often
// | {
//     type: "schematic_drawing"
//     drawing_type: "text"
//     schematic_component_id: string
//     align: string
//     x: number
//     y: number
//     text: string
//   }

type SchematicComponent = Soup.SchematicComponent

type SchematicTrace = Soup.SchematicTrace

type SchematicText = Soup.SchematicText

export interface CopperPour {
  type: "pcb_copper_pour"
  layer: LayerRef
  polygons: Array<{
    points: Array<{ x: number; y: number }>
  }>
}

export interface PCBImage {
  type: "pcb_image"
  width: number
  height: number
  x: number
  y: number
  align: "bottom-left"
  image_url: string
}

export type PCBDrill =
  | {
      type: "pcb_drill"
      x: number
      y: number
      radius: number
      through_all: true
      pcb_component_id?: string
      from_layer: undefined
      to_layer: undefined
    }
  | {
      type: "pcb_drill"
      x: number
      y: number
      radius: number
      from_layer: LayerRef
      to_layer: LayerRef
      pcb_component_id?: string
      through_all: false | undefined
    }

export interface PCBGroup {
  type: "pcb_group"
  source_group_id: string
}

export interface PCBConfig {
  type: "pcb_config"
  dimension_unit: "mm"
}

export type PCBError = Soup.PCBTraceError

export interface SourceGroup {
  type: "source_group"
  source_group_id: string
  name: string
  children_source_component_ids: string[]
}

export interface SourceError {
  type: "source_error"
  message: string
}

export interface Project {
  type: "project"
  // schematic_config: SchematicConfig
  schematic_components: SchematicComponent[]
  // schematic_groups: SchematicGroup[]
  schematic_traces: SchematicTrace[]
  schematic_texts: SchematicText[]
  schematic_ports: Soup.SchematicPort[]
  // pcb_config: PCBConfig
  // pcb_groups: PCBGroup[]
  pcb_components: Soup.PCBComponent[]
  pcb_traces: Soup.PCBTrace[]
  pcb_ports: Soup.PCBPort[]
  // source_config: SourceConfig
  source_traces: Soup.SourceTrace[]
  // source_groups: SourceGroup[]
  source_components: SourceComponent[]
  source_ports: Soup.SourcePort[]
}

// /**
//  * @deprecated
//  */
// export type AnyElement =
//   | Project
//   | SourceConfig
//   | SourceComponent
//   | SourceGroup
//   | Soup.SourceTrace
//   | Soup.SourcePort
//   | Soup.PCBTrace
//   | Soup.PCBComponent
//   | PCBGroup
//   | PCBConfig
//   | Soup.PCBPort
//   | Soup.PCBTrace
//   | Soup.PCBSMTPad
//   | PCBDrill
//   | Soup.PCBHole
//   | Soup.PCBPlatedHole
//   | Soup.PCBVia
//   | Soup.PCBPortNotMatchedError
//   | PCBError
//   | SchematicGroup
//   | SchematicComponent
//   | SchematicTrace
//   | SchematicConfig
//   | Soup.SchematicPort
//   | SchematicText
//   | SchematicDrawing
//   | SourceError
//   | Soup.PCBBoard

export type AnyElement = AnySoupElement

export type ElementType = AnyElement["type"]
export type ElementOfType<T extends ElementType> = Extract<
  AnyElement,
  { type: T }
>
