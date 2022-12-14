import * as Type from "lib/types"
import { Builder, SchematicDrawing } from "lib/types"
import { ProjectBuilder } from "../project-builder"
import { SchematicBoxBuilder } from "./schematic-box-builder"
import { SchematicLineBuilder } from "./schematic-line-builder"
import { SchematicTextBuilder } from "./schematic-text-builder"

type ChildBuilder = SchematicBoxBuilder | SchematicLineBuilder
// | SchematicTextBuilder

export interface SchematicSymbolBuilder {
  project_builder: ProjectBuilder
  builder_type: "schematic_symbol_builder"
  appendChild: (child: ChildBuilder) => SchematicSymbolBuilder
  build(bc: Type.BuildContext): SchematicDrawing[]
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
