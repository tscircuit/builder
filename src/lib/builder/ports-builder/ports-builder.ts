import * as Type from "lib/types"
import { Builder } from "lib/types"
import { Except, Simplify } from "type-fest"
import { ProjectBuilder } from "../project-builder"
import { createPortBuilder, PortBuilder } from "./port-builder"
import { directionToVec, multPoint, rotatePoint, sumPoints } from "lib/utils"

export const ports_builder_addables = {
  port: createPortBuilder,
}
export type PortsBuilderAddables = typeof ports_builder_addables

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
      pin_number?: number
      center: { x: number; y: number }
      facing_direction: "up" | "down" | "left" | "right"
    }) => PortsBuilder)

  add<T extends keyof PortsBuilderAddables>(
    builder_type: T,
    callback: (builder: ReturnType<PortsBuilderAddables[T]>) => unknown
  ): PortsBuilder

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
          .setPinNumber(params[0].pin_number)
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

  add(builder_type, callback) {
    if (!ports_builder_addables[builder_type]) {
      throw new Error(
        `No addable in ports builder for builder_type: "${builder_type}"`
      )
    }
    const builder = ports_builder_addables[builder_type](this.project_builder)
    callback(builder)
    this.ports.push(builder)
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
      const pin_number = port.pin_number
      return [
        {
          type: "source_port",
          name: port.name,
          source_port_id,
          source_component_id: this.source_component_id,
          pin_number,
        } as Type.SourcePort,
        {
          type: "schematic_port",
          schematic_port_id,
          source_port_id,
          center: bc.convert(port.schematic_position),
          facing_direction: port.schematic_direction,
          schematic_component_id: this.schematic_component_id,
        } as Type.SchematicPort,
        // add schematic port pin_number text if pin_number is set
        ...(!pin_number
          ? []
          : [
              {
                type: "schematic_text",
                schematic_port_id,
                schematic_text_id: project_builder.getId("schematic_text"),
                text: pin_number.toString(),
                anchor: "center",
                position: sumPoints([
                  bc.convert(port.schematic_position),

                  // Place the pin number text opposite to the direction the port
                  // is facing then "up a bit" so it ideally rests above the
                  // line connecting a bug to the port
                  rotatePoint({
                    point: multPoint(
                      directionToVec(port.schematic_direction),
                      0.175
                    ),
                    center: { x: 0, y: 0 },
                    rotationDeg:
                      (port.schematic_direction === "right" ? -1 : 1) * 135,
                  }),
                ]),
                schematic_component_id: this.schematic_component_id,
              } as Type.SchematicText,
            ]),
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
