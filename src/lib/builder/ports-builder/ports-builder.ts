import * as Type from "lib/types"
import { Builder } from "lib/types"
import { Except, Simplify } from "type-fest"
import { ProjectBuilder } from "../project-builder"
import { createPortBuilder, PortBuilder } from "./port-builder"

export type PortsBuilderCallback = (cb: PortsBuilder) => unknown
export interface PortsBuilder {
  builder_type: "ports_builder"
  project_builder: ProjectBuilder
  appendChild: (child: Builder) => PortsBuilder

  /**
   * @deprecated this add function doesn't match the other "add" patterns, will
   * be refactored and the method signature will change/will be renamed
   */
  addPort: ((portName: string, schematicPosition: Type.Point) => PortsBuilder) &
    ((params: {
      name: string
      center: { x: number; y: number }
      facing_direction: "up" | "down" | "left" | "right"
    }) => PortsBuilder)
  setSourceComponent: (source_component_id: string) => PortsBuilder
  setSchematicComponent: (schematic_component_id: string) => PortsBuilder
  setPCBComponent: (pcb_component_id: string) => PortsBuilder
  build(bc: Type.BuildContext): Type.AnyElement[]
}

export class PortsBuilderClass implements PortsBuilder {
  builder_type = "ports_builder" as const
  project_builder: ProjectBuilder
  source_component_id: string
  schematic_component_id: string
  pcb_component_id: string

  ports: PortBuilder[]

  constructor(project_builder: ProjectBuilder) {
    this.project_builder = project_builder
    this.ports = []
  }

  appendChild(child) {
    if (child.builder_type === "port_builder") {
      this.ports.push(child)
      return this
    }
    throw new Error(`"ports_builder" can only append "port_builder"`)
  }

  addPort(...params) {
    if (params.length === 1) {
      this.ports.push(
        createPortBuilder(this.project_builder)
          .setSchematicPosition(params[0].center)
          .setName(params[0].name)
          .setSchematicDirection(params[0].facing_direction)
      )
    } else {
      const [name, schematic_position] = params
      this.ports.push(
        createPortBuilder(this.project_builder)
          .setSchematicPosition(schematic_position)
          .setName(name)
      )
    }
    return this
  }

  setSourceComponent(source_component_id) {
    this.source_component_id = source_component_id
    return this
  }
  setSchematicComponent(schematic_component_id) {
    this.schematic_component_id = schematic_component_id
    return this
  }
  setPCBComponent(pcb_component_id) {
    this.pcb_component_id = pcb_component_id
    return this
  }

  build(bc: Type.BuildContext) {
    const { project_builder } = this
    return this.ports.flatMap((port) => {
      const source_port_id = project_builder.getId("source_port")
      const schematic_port_id = project_builder.getId("schematic_port")
      const pcb_port_id = project_builder.getId("pcb_port")
      return [
        {
          type: "source_port",
          name: port.name,
          source_port_id,
          source_component_id: this.source_component_id,
        } as Type.SourcePort,
        {
          type: "schematic_port",
          schematic_port_id,
          source_port_id,
          center: bc.convert(port.schematic_position),
          facing_direction: port.schematic_direction,
        } as Type.SchematicPort,
        {
          type: "pcb_port",
          pcb_port_id,
          source_port_id,
        } as Type.PCBPort,
      ] as Type.AnyElement[]
    }) as Type.AnyElement[]
  }
}

export const createPortsBuilder = (
  project_builder: ProjectBuilder
): PortsBuilder => {
  return new PortsBuilderClass(project_builder)
}
