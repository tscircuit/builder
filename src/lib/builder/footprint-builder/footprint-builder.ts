import { type ProjectBuilder } from "lib/project"
import { createPlatedHoleBuilder } from "./plated-hole-builder"
import { createHoleBuilder } from "./hole-builder"
import { createPcbViaBuilder } from "./pcb-via-builder"
import * as Type from "lib/types"
import { Builder } from "lib/types/builders"
import { compose, rotate, translate } from "transformation-matrix"
import {
  transformPCBElement,
  transformPCBElements,
  transformSchematicElement,
} from "../transform-elements"
import { SMTPadBuilder, createSMTPadBuilder } from "./smt-pad-builder"
import { associatePcbPortsWithPads } from "./associate-pcb-ports-with-pads"
import * as Footprint from "@tscircuit/footprints"
import SparkfunPackages, {
  SparkfunComponentId,
} from "@tscircuit/sparkfun-packages"
import { createSilkscreenPathBuilder } from "./silkscreen-path-builder"
import { createSilkscreenTextBuilder } from "./silkscreen-text-builder"
import { createSilkscreenLineBuilder } from "./silkscreen-line-builder"
import { createSilkscreenRectBuilder } from "./silkscreen-rect-builder"
import { createSilkscreenCircleBuilder } from "./silkscreen-circle-builder"
import { createBasicPcbTraceBuilder } from "./basic-pcb-trace-builder"

export type StandardFootprint =
  | "0402"
  | "0603"
  | "0805"
  | "1210"
  | SparkfunComponentId
export type FootprintBuilderCallback = (rb: FootprintBuilder) => unknown

const getFootprintBuilderAddables = () =>
  ({
    smtpad: createSMTPadBuilder,
    hole: createHoleBuilder,
    platedhole: createPlatedHoleBuilder,
    pcbvia: createPcbViaBuilder,
    silkscreenpath: createSilkscreenPathBuilder,
    silkscreentext: createSilkscreenTextBuilder,
    silkscreenline: createSilkscreenLineBuilder,
    silkscreenrect: createSilkscreenRectBuilder,
    silkscreencircle: createSilkscreenCircleBuilder,
    /* @deprecated */
    pcb_via: createPcbViaBuilder,
    pcbtrace: createBasicPcbTraceBuilder,
  } as const)

export type FootprintBuilderAddables = ReturnType<
  typeof getFootprintBuilderAddables
>

const allowed_childen_builder_types = [
  "smtpad_builder",
  "hole_builder",
  "plated_hole_builder",
  "via_builder",
  "silkscreen_path_builder",
  "silkscreen_text_builder",
  "silkscreen_line_builder",
  "silkscreen_rect_builder",
  "silkscreen_circle_builder",
  "basic_trace_builder",
]

export interface FootprintBuilder {
  builder_type: "footprint_builder"
  project_builder: ProjectBuilder
  addables: FootprintBuilderAddables
  position: Type.Point
  rotation: number
  layer: Type.LayerRef
  setPosition: (x: number | string, y: number | string) => FootprintBuilder
  appendChild: (child: Builder) => FootprintBuilder
  addPad(cb: (smtpadbuilder: SMTPadBuilder) => unknown): FootprintBuilder
  add<T extends keyof FootprintBuilderAddables>(
    builder_type: T,
    callback: (builder: ReturnType<FootprintBuilderAddables[T]>) => unknown
  ): FootprintBuilder
  setStandardFootprint(footprint_name: SparkfunComponentId): FootprintBuilder
  loadStandardFootprint(footprint_name: SparkfunComponentId): FootprintBuilder
  setRotation: (rotation: number | `${number}deg`) => FootprintBuilder
  setLayer: (layer: Type.LayerRef) => FootprintBuilder
  build(bc: Type.BuildContext): Promise<Type.AnyElement[]>
}

export class FootprintBuilderClass implements FootprintBuilder {
  builder_type: "footprint_builder" = "footprint_builder"
  project_builder: ProjectBuilder
  addables: FootprintBuilderAddables
  position: Type.Point
  rotation: number = 0
  layer: Type.LayerRef = "top"

  children: SMTPadBuilder[] = []

  constructor(project_builder: ProjectBuilder) {
    this.project_builder = project_builder
    this.addables = getFootprintBuilderAddables()
    this.position = { x: 0, y: 0 }
  }

  appendChild(child) {
    if (allowed_childen_builder_types.includes(child.builder_type)) {
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

  setLayer(layer: Type.LayerRef) {
    this.layer = layer

    for (const child of this.children) {
      if (child.builder_type === "smtpad_builder") {
        child.setLayer(layer)
      }
    }

    return this
  }

  loadStandardFootprint(footprint_name: StandardFootprint) {
    if (footprint_name === "0805") footprint_name = "sparkfun:0805"
    if (footprint_name === "0603") footprint_name = "sparkfun:0603"
    if (footprint_name === "1210") footprint_name = "sparkfun:1210"
    if (footprint_name === "0402") {
      this.addPad((smtpad) => {
        smtpad.setShape("rect")
        smtpad.setSize(0.6, 0.6)
        smtpad.setPosition(-0.5, 0)
        smtpad.setLayer(this.layer)
        smtpad.addPortHints(["left", "1"])
        // smtpad.setSize("0.5mm", "0.5mm")
        // smtpad.setPosition("-0.5mm", "0mm")
      })
      this.addPad((smtpad) => {
        smtpad.setShape("rect")
        smtpad.setSize(0.6, 0.6)
        smtpad.setPosition(0.5, 0)
        smtpad.setLayer(this.layer)
        smtpad.addPortHints(["right", "2"])
      })
    } else if (footprint_name in SparkfunPackages) {
      const sf_pkg = SparkfunPackages[footprint_name]
      for (const smd of sf_pkg.smd!) {
        this.addPad((smtpad) => {
          smtpad.setShape("rect")
          smtpad.setSize(smd.dx, smd.dy)
          smtpad.setPosition(smd.x, smd.y)
          smtpad.setLayer(smd.layer === 1 ? this.layer : "silkscreen")

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
      throw new Error(
        `Unknown standard footprint name: "${footprint_name}" (examples: 0402, 0603)`
      )
    }
    return this
  }

  setStandardFootprint(footprint_name: StandardFootprint): FootprintBuilder {
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
    this.setLayer(this.layer) // make sure layer propagates properly to children
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
