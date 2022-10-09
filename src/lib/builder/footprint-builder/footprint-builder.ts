import { BaseComponentBuilder, ProjectBuilder } from "lib/project"
import * as Type from "lib/types"
import { SMTPadBuilder, createSMTPadBuilder } from "./smt-pad-builder"

export type FootprintBuilderCallback = (rb: FootprintBuilder) => unknown

const addables = {
  smtpad: createSMTPadBuilder,
} as const

export interface FootprintBuilder {
  builder_type: "footprint_builder"
  project_builder: ProjectBuilder
  addables: typeof addables
  addPad(cb: (smtpadbuilder: SMTPadBuilder) => unknown): FootprintBuilder
  add<T extends keyof typeof addables>(
    builder_type: T,
    callback: (builder: ReturnType<typeof addables[T]>) => unknown
  ): FootprintBuilder
  build(): Promise<Type.AnyElement[]>
}

export class FootprintBuilderClass implements FootprintBuilder {
  builder_type: "footprint_builder"
  project_builder: ProjectBuilder
  addables = addables

  children: SMTPadBuilder[] = []

  constructor(project_builder: ProjectBuilder) {
    this.project_builder = project_builder
  }

  add(new_builder_type, cb) {
    const new_builder = addables[new_builder_type](this.project_builder)
    cb(new_builder)
    this.children.push(new_builder)
    return this
  }

  addPad(cb) {
    const smtpadbuilder = createSMTPadBuilder(this.project_builder)
    cb(smtpadbuilder)
    this.children.push(smtpadbuilder)
    return this
  }

  async build(): Promise<Type.AnyElement[]> {
    const built_elements = []
    for (const child of this.children) {
      const built = await child.build()
      built_elements.push(...built)
    }
    return built_elements
  }
}

export const createFootprintBuilder = (
  project_builder: ProjectBuilder
): FootprintBuilder => {
  return new FootprintBuilderClass(project_builder)
}
