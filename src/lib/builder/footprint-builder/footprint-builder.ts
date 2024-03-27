import { type ProjectBuilder } from "lib/project"
import { createPlatedHoleBuilder } from "./plated-hole-builder"
import { createHoleBuilder } from "./hole-builder"
import * as Type from "lib/types"
import { Builder } from "lib/types/builders"
import { compose, rotate, translate } from "transformation-matrix"
import {
  transformPCBElement,
  transformPCBElements,
  transformSchematicElement,
} from "../transform-elements"
import { SMTPadBuilder, createSMTPadBuilder } from "./smt-pad-builder"
import MiniSearch from "minisearch"
import { associatePcbPortsWithPads } from "./associate-pcb-ports-with-pads"
import * as Footprint from "@tscircuit/footprints"

export type FootprintBuilderCallback = (rb: FootprintBuilder) => unknown

export type StandardFootprintName = "0402" | "0603"

const getFootprintBuilderAddables = () =>
  ({
    smtpad: createSMTPadBuilder,
    hole: createHoleBuilder,
    platedhole: createPlatedHoleBuilder,
  } as const)

export type FootprintBuilderAddables = ReturnType<
  typeof getFootprintBuilderAddables
>

export interface FootprintBuilder {
  builder_type: "footprint_builder"
  project_builder: ProjectBuilder
  addables: FootprintBuilderAddables
  position: Type.Point
  rotation: number
  setPosition: (x: number | string, y: number | string) => FootprintBuilder
  appendChild: (child: Builder) => FootprintBuilder
  addPad(cb: (smtpadbuilder: SMTPadBuilder) => unknown): FootprintBuilder
  add<T extends keyof FootprintBuilderAddables>(
    builder_type: T,
    callback: (builder: ReturnType<FootprintBuilderAddables[T]>) => unknown
  ): FootprintBuilder
  setStandardFootprint(footprint_name: StandardFootprintName): FootprintBuilder
  loadStandardFootprint(footprint_name: StandardFootprintName): FootprintBuilder
  setRotation: (rotation: number | `${number}deg`) => FootprintBuilder
  build(bc: Type.BuildContext): Promise<Type.AnyElement[]>
}

export class FootprintBuilderClass implements FootprintBuilder {
  builder_type: "footprint_builder" = "footprint_builder"
  project_builder: ProjectBuilder
  addables: FootprintBuilderAddables
  position: Type.Point
  rotation: number = 0

  children: SMTPadBuilder[] = []

  constructor(project_builder: ProjectBuilder) {
    this.project_builder = project_builder
    this.addables = getFootprintBuilderAddables()
    this.position = { x: 0, y: 0 }
  }

  appendChild(child) {
    if (child.builder_type === "smtpad_builder") {
      this.children.push(child)
      return this
    } else if (child.builder_type === "plated_hole_builder") {
      this.children.push(child)
      return this
    } else if (child.builder_type === "footprint_builder") {
      if (this.children.length > 0) {
        throw new Error(
          "Footprint builder cannot be replaced by child footprint builder because the parent footprint builder has children. In the future we may support merging footprint builders"
        )
      }
      this.position = child.position
      this.rotation = child.rotation
      this.children.push(...child.children)
      return this
    }
    throw new Error(
      `Unsupported child for footprint builder: "${child.builder_type}"`
    )
  }

  add(new_builder_type, cb) {
    const new_builder = this.addables[new_builder_type](this.project_builder)
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

  loadStandardFootprint(footprint_name: "0402") {
    // TODO check sparkfun footprints
    if (footprint_name === "0402") {
      this.addPad((smtpad) => {
        smtpad.setShape("rect")
        smtpad.setSize(0.6, 0.6)
        smtpad.setPosition(-0.5, 0)
        smtpad.setLayer("top")
        smtpad.addPortHints(["left", "1"])
        // smtpad.setSize("0.5mm", "0.5mm")
        // smtpad.setPosition("-0.5mm", "0mm")
      })
      this.addPad((smtpad) => {
        smtpad.setShape("rect")
        smtpad.setSize(0.6, 0.6)
        smtpad.setPosition(0.5, 0)
        smtpad.setLayer("top")
        smtpad.addPortHints(["right", "2"])
      })
    } else if (footprint_name in sparkfunPackages) {
      const sf_pkg = sparkfunPackages[footprint_name]
      for (const smd of sf_pkg.smd!) {
        this.addPad((smtpad) => {
          smtpad.setShape("rect")
          smtpad.setSize(smd.dx, smd.dy)
          smtpad.setPosition(smd.x, smd.y)
          smtpad.setLayer(smd.layer === 1 ? "top" : "silkscreen")

          const position_hints = []

          if (sf_pkg.smd!.length === 2) {
            const other_smd = sf_pkg.smd!.find((s) => s !== smd)!
            if (smd.x < other_smd.x) {
              smtpad.addPortHints(["left"])
            } else if (smd.x > other_smd.x) {
              smtpad.addPortHints(["right"])
            }
          }
          smtpad.addPortHints([smd.name.toString()])
        })
      }
      // TODO sf_pkg.wire
      // TODO sf_pkg.text
    } else {
      const closest_sf_pkg_name = miniSearch.search(footprint_name)
      throw new Error(
        `Unknown standard footprint name: "${footprint_name}" (examples: 0402, 0603, ${closest_sf_pkg_name
          .slice(0, 3)
          .map((v) => v.name)
          .join(",")})`
      )
    }
    return this
  }

  setStandardFootprint(
    footprint_name: StandardFootprintName
  ): FootprintBuilder {
    return this.loadStandardFootprint(footprint_name)
  }

  setPosition(x, y) {
    this.position.x = x
    this.position.y = y
    return this
  }

  setRotation(rotation) {
    if (typeof rotation === "number") {
      this.rotation = rotation
    } else {
      this.rotation = (parseFloat(rotation.split("deg")[0]) / 180) * Math.PI
    }
    return this
  }

  reset() {
    this.children = []
    return this
  }

  async build(bc: Type.BuildContext): Promise<Type.AnyElement[]> {
    const built_elements: Type.AnyElement[] = []
    for (const child of this.children) {
      const built = await child.build(bc)
      built_elements.push(...built)
    }

    const my_position = bc.convert(this.position)

    const transformed_elements = transformPCBElements(
      built_elements,
      compose(translate(my_position.x, my_position.y), rotate(this.rotation))
    )

    return transformed_elements
  }
}

export const createFootprintBuilder = (
  project_builder: ProjectBuilder
): FootprintBuilder => {
  return new FootprintBuilderClass(project_builder)
}
