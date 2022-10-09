import * as Type from "lib/types"
import { Except, Simplify } from "type-fest"
import { ProjectBuilder } from "lib/builder/project-builder"
import {
  PortsBuilder,
  createPortsBuilder,
} from "lib/builder/ports-builder/ports-builder"
import { compose, rotate, transform, translate } from "transformation-matrix"
import { transformSchematicElements } from "lib/builder/transform-elements"
import getPortPosition from "./get-port-position"
import { AnyElement, Point, SchematicComponent } from "lib/types"
import { createFootprintBuilder, FootprintBuilder } from "../footprint-builder"

export interface BaseComponentBuilder<T> {
  project_builder: ProjectBuilder
  ports: PortsBuilder
  footprint: FootprintBuilder
  setName: (name: string) => BaseComponentBuilder<T>
  setTag: (tag: string) => BaseComponentBuilder<T>
  setTags: (tags: string[]) => BaseComponentBuilder<T>
  appendChild(child: { builder_type: string }): BaseComponentBuilder<T>
  setSourceProperties(
    properties: Simplify<
      Except<
        Type.SourceComponent,
        "type" | "source_component_id" | "ftype" | "name"
      >
    > & { name?: string }
  ): BaseComponentBuilder<T>
  setSchematicCenter(x: number, y: number): BaseComponentBuilder<T>
  setSchematicRotation(
    rotation: number | `${number}deg`
  ): BaseComponentBuilder<T>
  setSchematicProperties(
    properties: Partial<Type.SchematicComponent>
  ): BaseComponentBuilder<T>
  labelPort(position: number, name: string): BaseComponentBuilder<T>
  build(): Promise<Type.AnyElement[]>
}

export type GenericComponentBuilder =
  BaseComponentBuilder<GenericComponentBuilder> & {
    builder_type: "generic_component_builder"
    setFType: (ftype: string) => GenericComponentBuilder
  }
export type GenericComponentBuilderCallback = (
  cb: GenericComponentBuilder
) => unknown

export class ComponentBuilderClass implements GenericComponentBuilder {
  name: string = null
  builder_type = "generic_component_builder" as any
  tags: string[] = []
  source_properties: any = {}
  schematic_properties: any = {}
  schematic_rotation: number = 0
  schematic_position: Point = { x: 0, y: 0 }
  ports: PortsBuilder
  footprint: FootprintBuilder
  constructor(public project_builder: ProjectBuilder) {
    this.ports = createPortsBuilder(project_builder)
    this.footprint = createFootprintBuilder(project_builder)
  }

  appendChild(child) {
    // Based on the child type, add to appropriate builder
    switch (child.builder_type) {
      case "port_builder": {
        this.ports.appendChild(child)
        return this
      }
      case "smtpad_builder": {
        this.footprint.appendChild(child)
      }
    }

    throw new Error(
      `Can't add child builder type: "${child.builder_type}" inside component builder`
    )
  }

  setTag(tag) {
    this.tags.push(tag)
    return this
  }

  setTags(tags) {
    this.tags.push(...tags)
    return this
  }

  setName(name) {
    this.name = name
    return this
  }

  setFType(ftype: string) {
    this.source_properties.ftype = ftype
    return this
  }

  setSourceProperties(props) {
    this.source_properties = {
      ...this.source_properties,
      ...props,
    }
    return this
  }

  setSchematicCenter(x, y) {
    this.schematic_position = { x, y }
    return this
  }

  setSchematicRotation(rotation) {
    if (typeof rotation === "number") {
      this.schematic_rotation = rotation
    } else {
      this.schematic_rotation =
        (parseFloat(rotation.split("deg")[0]) / 180) * Math.PI
    }
    return this
  }

  setSchematicProperties(props) {
    this.schematic_properties = {
      ...this.schematic_properties,
      ...props,
    }
    return this
  }

  labelPort(position, name) {
    this.schematic_properties.port_labels ??= {}
    this.schematic_properties.port_labels[position] = name
    return this
  }

  async build() {
    const elements = []
    elements.push(...(await this.ports.build()))
    // TODO schematic box of some kind
    elements.push(...(await this.footprint.build()))
    return elements
  }
}

export const createComponentBuilder = (
  project_builder: ProjectBuilder
): GenericComponentBuilder => {
  return new ComponentBuilderClass(project_builder)
}