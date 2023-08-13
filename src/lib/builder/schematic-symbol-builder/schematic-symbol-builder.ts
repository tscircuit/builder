import * as Type from "lib/types"
import { Builder, SchematicDrawing } from "lib/types"
import { ProjectBuilder } from "../project-builder"
import {
  SchematicBoxBuilder,
  createSchematicBoxBuilder,
} from "./schematic-box-builder"
import {
  SchematicLineBuilder,
  createSchematicLineBuilder,
} from "./schematic-line-builder"
import { createSchematicTextBuilder } from "./schematic-text-builder"

const schematic_symbol_addables = {
  schematic_box: createSchematicBoxBuilder,
  schematic_line: createSchematicLineBuilder,
  schematic_text: createSchematicTextBuilder,
}

type SchematicSymbolAddables = typeof schematic_symbol_addables

type ChildBuilder = SchematicBoxBuilder | SchematicLineBuilder
// | SchematicTextBuilder

export interface SchematicSymbolBuilder {
  project_builder: ProjectBuilder
  builder_type: "schematic_symbol_builder"
  appendChild: (child: ChildBuilder) => SchematicSymbolBuilder
  build(bc: Type.BuildContext): SchematicDrawing[]
  add<T extends keyof SchematicSymbolAddables>(
    builder_type: T,
    callback: (builder: ReturnType<SchematicSymbolAddables[T]>) => unknown
  ): SchematicSymbolBuilder
}

export class SchematicSymbolBuilderClass implements SchematicSymbolBuilder {
  project_builder: ProjectBuilder
  builder_type: "schematic_symbol_builder" = "schematic_symbol_builder"
  children: ChildBuilder[]

  constructor(project_builder: ProjectBuilder) {
    this.project_builder = project_builder
    this.children = []
  }

  appendChild(child: ChildBuilder) {
    if (
      ![
        "schematic_box_builder",
        "schematic_line_builder",
        "schematic_text_builder",
      ].includes(child.builder_type)
    ) {
      if ((child as any).builder_type === "schematic_symbol_builder") {
        throw new Error(`Schematic symbol builder nesting not yet supported!`)
      }
      throw new Error(
        `Unsupported child type for inside of schematic symbol builder: ${child.builder_type}`
      )
    }

    this.children.push(child as any)
    return this
  }

  add(builder_type, callback) {
    if (!schematic_symbol_addables[builder_type]) {
      throw new Error(
        `No addable in schematic symbol builder for builder_type: "${builder_type}"`
      )
    }
    const builder = schematic_symbol_addables[builder_type](
      this.project_builder
    )
    callback(builder)
    this.children.push(builder)
    return this
  }

  build(bc: Type.BuildContext): SchematicDrawing[] {
    if (!bc.schematic_component_id)
      throw new Error(
        "Can't render symbols without schematic_component_id from context"
      )

    const components_wo_id = this.children.map((child) => child.build(bc))

    const components_w_id = components_wo_id.map((component) => ({
      ...component,
      schematic_component_id: bc.schematic_component_id,
    }))

    return components_w_id
  }
}

export const createSchematicSymbolBuilder = (
  project_builder: ProjectBuilder
): SchematicSymbolBuilder => {
  return new SchematicSymbolBuilderClass(project_builder) as any
}
