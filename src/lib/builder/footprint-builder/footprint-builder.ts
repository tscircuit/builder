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
import { createSilkscreenPathBuilder } from "./silkscreen-path-builder"
import { createSilkscreenTextBuilder } from "./silkscreen-text-builder"
import { createSilkscreenLineBuilder } from "./silkscreen-line-builder"
import { createSilkscreenRectBuilder } from "./silkscreen-rect-builder"
import { createSilkscreenCircleBuilder } from "./silkscreen-circle-builder"
import { createBasicPcbTraceBuilder } from "./basic-pcb-trace-builder"
import { createFabricationNotePathBuilder } from "./fabrication-note-path-builder"
import { createFabricationNoteTextBuilder } from "./fabrication-note-text-builder"
import { fp } from "@tscircuit/footprinter"

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
    fabricationnotepath: createFabricationNotePathBuilder,
    fabricationnotetext: createFabricationNoteTextBuilder,
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
  "basic_pcb_trace_builder",
  "fabrication_note_path_builder",
  "fabrication_note_text_builder",
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
  setStandardFootprint(footprint_name: string): FootprintBuilder
  loadStandardFootprint(footprint_name: string): FootprintBuilder
  loadFootprintFromSoup(soup: Type.AnySoupElement[]): FootprintBuilder
  setRotation: (rotation: number | `${number}deg`) => FootprintBuilder
  setLayer: (layer: Type.LayerRef) => FootprintBuilder
  build(bc: Type.BuildContext): Promise<Type.AnyElement[]>
}

export class FootprintBuilderClass implements FootprintBuilder {
  builder_type = "footprint_builder" as const
  project_builder: ProjectBuilder
  addables: FootprintBuilderAddables
  position: Type.Point
  rotation = 0
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

  loadFootprintFromSoup(soup: Type.AnySoupElement[]) {
    const fb: FootprintBuilder = this
    for (const elm of soup) {
      if (elm.type === "pcb_smtpad") {
        fb.add("smtpad", (pb) => pb.setProps(elm))
      } else if (elm.type === "pcb_plated_hole") {
        fb.add("platedhole", (pb) => pb.setProps(elm))
      } else if (elm.type === "pcb_hole") {
        fb.add("hole", (pb) => pb.setProps(elm))
      } else if (elm.type === "pcb_silkscreen_circle") {
        fb.add("silkscreencircle", (pb) =>
          pb.setProps({
            ...elm,
            pcbX: elm.center.x,
            pcbY: elm.center.y,
          })
        )
      } else if (elm.type === "pcb_silkscreen_line") {
        fb.add("silkscreenline", (pb) =>
          pb.setProps({
            ...elm,
            strokeWidth: elm.stroke_width,
          })
        )
      } else if (elm.type === "pcb_silkscreen_path") {
        fb.add("silkscreenpath", (pb) =>
          pb.setProps({
            ...elm,
            strokeWidth: elm.stroke_width,
          })
        )
      } else if (elm.type === "pcb_silkscreen_rect") {
        fb.add("silkscreenrect", (pb) =>
          pb.setProps({
            ...elm,
            pcbX: elm.center.x,
            pcbY: elm.center.y,
            // TODO silkscreen rect isFilled, isOutline etc.
          })
        )
      } else if (elm.type === "pcb_fabrication_note_path") {
        fb.add("fabricationnotepath", (pb) => pb.setProps(elm))
      } else if (elm.type === "pcb_fabrication_note_text") {
        fb.add("fabricationnotetext", (pb) =>
          pb.setProps({
            ...elm,
            pcbX: elm.anchor_position.x,
            pcbY: elm.anchor_position.y,
            anchorAlignment: elm.anchor_alignment,
            fontSize: elm.font_size,
          })
        )
      }
    }
    return this
  }

  loadStandardFootprint(footprint_name: string) {
    try {
      const fp_soup = fp.string(footprint_name).soup()
      this.loadFootprintFromSoup(fp_soup)
    } catch (e: any) {
      throw new Error(
        `Could not understand footprint: "${footprint_name}" (examples: 0402, 0603)\n\n${e.toString()}`
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
