import type * as Type from "lib/types"
import type { ProjectBuilder } from "../project-builder"
import {
  ComponentBuilderClass,
  type BaseComponentBuilder,
} from "./ComponentBuilder"

export type EagleImportBuilderCallback = (rb: EagleImportBuilder) => unknown
export interface EagleImportBuilder
  extends BaseComponentBuilder<EagleImportBuilder> {
  importEagle(eagleXML: string): EagleImportBuilder
}

export class EagleImportBuilderClass
  extends ComponentBuilderClass
  implements EagleImportBuilder
{
  constructor(project_builder: ProjectBuilder) {
    super(project_builder)
    this.source_properties = {
      ...this.source_properties,
      ftype: "simple_bug",
    }
  }

  importEagle(eagleXML: string) {
    return this
  }

  async build() {
    const elements: Type.AnyElement[] = []
    // Eagle components can have multiple schematic elements e.g. bugs
    return elements
  }
}

export const createEagleImportBuilder = (
  project_builder: ProjectBuilder
): EagleImportBuilder => {
  return new EagleImportBuilderClass(project_builder)
}
