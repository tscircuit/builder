import { BaseComponentBuilder, ProjectBuilder } from "lib/project"
import * as Type from "lib/types"
import { Builder } from "lib/types/builders"
import { compose, rotate, translate } from "transformation-matrix"
import {
  transformPCBElement,
  transformPCBElements,
  transformSchematicElement,
} from "../transform-elements"
import { SMTPadBuilder, createSMTPadBuilder } from "./smt-pad-builder"
import sparkfunPackages from "@tscircuit/sparkfun-packages"

export type FootprintBuilderCallback = (rb: FootprintBuilder) => unknown

const addables = {
  smtpad: createSMTPadBuilder,
} as const

export interface FootprintBuilder {
  builder_type: "footprint_builder"
  project_builder: ProjectBuilder
  addables: typeof addables
  position: Type.Point
  setPosition: (x: number | string, y: number | string) => FootprintBuilder
  appendChild: (child: Builder) => FootprintBuilder
  addPad(cb: (smtpadbuilder: SMTPadBuilder) => unknown): FootprintBuilder
  add<T extends keyof typeof addables>(
    builder_type: T,
    callback: (builder: ReturnType<typeof addables[T]>) => unknown
  ): FootprintBuilder
  setStandardFootprint(footprint_name: string): FootprintBuilder
  loadStandardFootprint(footprint_name: string): FootprintBuilder
  build(bc: Type.BuildContext): Promise<Type.AnyElement[]>
}

export class FootprintBuilderClass implements FootprintBuilder {
  builder_type: "footprint_builder"
  project_builder: ProjectBuilder
  addables = addables
  position: Type.Point

  children: SMTPadBuilder[] = []

  constructor(project_builder: ProjectBuilder) {
    this.project_builder = project_builder
    this.position = { x: 0, y: 0 }
  }

  appendChild(child) {
    if (child.builder_type === "smtpad_builder") {
      this.children.push(child)
      return this
    } else if (child.builder_type === "plated_hole_builder") {
      this.children.push(child)
      return this
    }
    throw new Error(
      `Unsupported child for footprint builder: "${child.builder_type}"`
    )
  }

  add(new_builder_type, cb) {
    const new_builder = addables[new_builder_type](this.project_builder)
    cb(new_builder)
    this.children.push(new_builder)
    return this
  }

  addPad(cb: (smtpadbuilder: SMTPadBuilder) => unknown) {
    const smtpadbuilder = createSMTPadBuilder(this.project_builder)
    cb(smtpadbuilder)
    this.children.push(smtpadbuilder)
    return this
  }

  loadStandardFootprint(footprint_name: string) {
    // TODO check sparkfun footprints
    if (footprint_name === "0402") {
      this.addPad((smtpad) => {
        smtpad.setShape("rect")
        smtpad.setSize(0.6, 0.6)
        smtpad.setPosition(-0.5, 0)
        smtpad.setLayer("top")
        // smtpad.setSize("0.5mm", "0.5mm")
        // smtpad.setPosition("-0.5mm", "0mm")
      })
      this.addPad((smtpad) => {
        smtpad.setShape("rect")
        smtpad.setSize(0.6, 0.6)
        smtpad.setPosition(0.5, 0)
        smtpad.setLayer("top")
      })
    } else if (footprint_name in sparkfunPackages) {
      // TODO convert package to builder pads
    } else {
      throw new Error(
        `Unknown standard footprint name: "${footprint_name}" (examples: 0402, 0603)`
      )
    }
    return this
  }

  setStandardFootprint(footprint_name: string): FootprintBuilder {
    return this.loadStandardFootprint(footprint_name)
  }

  setPosition(x, y) {
    this.position.x = x
    this.position.y = y
    return this
  }

  async build(bc: Type.BuildContext): Promise<Type.AnyElement[]> {
    const built_elements = []
    for (const child of this.children) {
      const built = await child.build(bc)
      built_elements.push(...built)
    }

    const my_position = bc.convert(this.position)

    const transformed_elements = transformPCBElements(
      built_elements,
      compose(
        translate(my_position.x, my_position.y)
        // rotate(this.rotation)
      )
    )

    return built_elements
  }
}

export const createFootprintBuilder = (
  project_builder: ProjectBuilder
): FootprintBuilder => {
  return new FootprintBuilderClass(project_builder)
}
