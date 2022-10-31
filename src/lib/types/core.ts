import { SourceComponent } from "./source-component"
import {Dimension} from "./util"

export interface SchematicConfig {
  type: "schematic_config"
}

export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

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

export type SchematicDrawing =
  | {
      drawing_type: "box"
      width: number
      height: number
      x: number
      y: number
    }
  | {
      drawing_type: "line"
      x1: number
      x2: number
      y1: number
      y2: number
    }
  // TODO this text type seems redundant with schematic_text...
  // It's attached to the symbol, so probably shouldn't be used often
  | {
      drawing_type: "text"
      align: string
      x: number
      y: number
      text: string
    }

export interface SchematicComponent {
  type: "schematic_component"
  rotation: number
  size: Size
  center: Point
  source_component_id: string
  schematic_component_id: string

  drawing?: {
    elements: Array<SchematicDrawing>
  }

  // TODO only for schematic-bug
  port_arrangement?: {
    left_size: number
    right_size: number
    top_size?: number
    bottom_size?: number
  }
  port_labels?: {
    [port_number: string]: string
  }
}

export interface SchematicTrace {
  type: "schematic_trace"
  schematic_trace_id: string
  source_trace_id: string
  edges: Array<{
    from: { x: number; y: number }
    to: { x: number; y: number }
    from_schematic_port_id?: string
    to_schematic_port_id?: string
  }>
}

export interface SchematicText {
  type: "schematic_text"
  schematic_component_id: string
  schematic_text_id: string
  text: string
  position: Point
  anchor: "center" | "left" | "right" | "top" | "bottom"
}

export interface SchematicPort {
  type: "schematic_port"
  schematic_port_id: string
  source_port_id: string
  center: Point
  facing_direction?: "up" | "down" | "left" | "right"
}

export interface LayerRef {
  name: string
}

export interface PCBTrace {
  type: "pcb_trace"
  source_trace_id: string
  pcb_trace_id: string
  route: Array<
    | {
        route_type: "wire"
        x: number
        y: number
        width: number
        // cap: "butt" | "round" | "square"
        start_pcb_port_id?: string
        end_pcb_port_id?: string
        layer: LayerRef
      }
    | {
        route_type: "via"
        x: number
        y: number
        from_layer: LayerRef
        to_layer: LayerRef
      }
  >
}

export interface PCBVia {
  type: "pcb_via"
  outer_diameter: number
  hole_diameter: number
  x: number
  y: number
}

export interface PCBPlatedHole {
  type: "pcb_plated_hole"
  outer_diameter: number
  hole_diameter: number
  x: number
  y: number
}

export interface PCBHole {
  type: "pcb_hole"
  hole_diameter: number
  x: number
  y: number
}

export interface PCBText {
  type: "pcb_text"
  text: string
  x: number
  y: number
  align: "bottom-left"
  width: number
  height: number
  lines: number
}

export interface PCBBoard {
  type: "pcb_board"
  width: number
  height: number
  x: number
  y: number
  align: "bottom-left"
}

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

export type PCBSMTPad =
  | {
      type: "pcb_smtpad"
      shape: "circle"
      x: number
      y: number
      radius: number
      layer: LayerRef
      pcb_component_id?: string
      pcb_port_id?: string
    }
  | {
      type: "pcb_smtpad"
      shape: "rect"
      x: number
      y: number
      width: number
      height: number
      layer: LayerRef
      pcb_component_id?: string
      pcb_port_id?: string
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

export interface PCBComponent {
  type: "pcb_component"
  pcb_component_id: string
  source_component_id: string
}

export interface PCBPort {
  type: "pcb_port"
  pcb_port_id: string
  source_port_id: string
}

export interface PCBGroup {
  type: "pcb_group"
  source_group_id: string
}

export interface PCBConfig {
  type: "pcb_config"
  dimension_unit: "mm"
}

export interface SourceTrace {
  type: "source_trace"
  source_trace_id: string
  connected_source_port_ids: string[]
}

export interface SourceGroup {
  type: "source_group"
  source_group_id: string
  name: string
  children_source_component_ids: string[]
}

export interface SourcePort {
  type: "source_port"
  name: string
  source_port_id: string
  source_component_id: string
}

export interface Project {
  type: "project"
  schematic_config: SchematicConfig
  schematic_components: SchematicComponent[]
  schematic_groups: SchematicGroup[]
  schematic_traces: SchematicTrace[]
  schematic_texts: SchematicText[]
  schematic_ports: SchematicPort[]
  pcb_config: PCBConfig
  pcb_groups: PCBGroup[]
  pcb_components: PCBComponent[]
  pcb_traces: PCBTrace[]
  pcb_ports: PCBPort[]
  source_config: SourceConfig
  source_traces: SourceTrace[]
  source_groups: SourceGroup[]
  source_components: SourceComponent[]
  source_ports: SourcePort[]
}

export type AnyElement =
  | Project
  | SourceConfig
  | SourceComponent
  | SourceGroup
  | SourceTrace
  | SourcePort
  | PCBTrace
  | PCBComponent
  | PCBGroup
  | PCBConfig
  | PCBPort
  | PCBTrace
  | PCBSMTPad
  | PCBDrill
  | PCBHole
  | PCBPlatedHole
  | PCBVia
  | SchematicGroup
  | SchematicComponent
  | SchematicTrace
  | SchematicConfig
  | SchematicPort
  | SchematicText

export type ElementType = AnyElement["type"]
export type ElementOfType<T extends ElementType> = Extract<
  AnyElement,
  { type: T }
>
