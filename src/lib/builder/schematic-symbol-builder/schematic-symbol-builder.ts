import * as Type from "lib/types"
import { Builder } from "lib/types"
import { ProjectBuilder } from "../project-builder"
import { SchematicBoxBuilder } from "./schematic-box-builder"
import { SchematicLineBuilder } from "./schematic-line-builder"
import { SchematicTextBuilder } from "./schematic-text-builder"

export interface SchematicSymbolBuilder {
  project_builder: ProjectBuilder
  builder_type: "schematic_symbol_builder"
  build(): Type.AnyElement[]
}

export class SchematicSymbolBuilderClass implements SchematicSymbolBuilder {
  project_builder: ProjectBuilder
  builder_type: "schematic_symbol_builder" = "schematic_symbol_builder"
  children: Array<
    SchematicBoxBuilder | SchematicLineBuilder | SchematicTextBuilder
  >

  constructor(project_builder: ProjectBuilder) {
    this.project_builder = project_builder
  }

  appendChild(child: Builder) {
    if (
      ![
        "schematic_box_builder",
        "schematic_line_builder",
        "schematic_text_builder",
      ].includes(child.builder_type)
    ) {
      if (child.builder_type === "schematic_symbol_builder") {
        throw new Error(`Schematic symbol builder nesting not yet supported!`)
      }
      throw new Error(
        `Unsupported child type for inside of schematic symbol builder: ${child.builder_type}`
      )
    }

    this.children.push(child as any)
  }

  build() {
    return []
  }
}

export const createSchematicSymbolBuilder = (
  project_builder: ProjectBuilder
): SchematicSymbolBuilder => {
  return new SchematicSymbolBuilderClass(project_builder)
}
