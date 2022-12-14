import * as Type from "lib/types"
import { ProjectBuilder } from "lib/project"
import { Dimension } from "lib/types"

export interface SMTPadBuilder {
  builder_type: "smtpad_builder"
  project_builder: ProjectBuilder
  setShape(shape: Type.PCBSMTPad["shape"]): SMTPadBuilder
  setSize(width: number, height: number): SMTPadBuilder
  setRadius(radius: number): SMTPadBuilder
  setLayer(layer: Type.PCBSMTPad["layer"] | string): SMTPadBuilder
  setPosition(x: number, y: number): SMTPadBuilder
  build(bc: Type.BuildContext): Promise<Type.PCBSMTPad[]>
}

type RectProps = Extract<Type.PCBSMTPad, { shape: "rect" }>
type CircleProps = Extract<Type.PCBSMTPad, { shape: "circle" }>

export class SMTPadBuilderClass implements SMTPadBuilder {
  project_builder: ProjectBuilder
  builder_type = "smtpad_builder" as const

  width: Dimension
  height: Dimension
  radius: Dimension
  x: Dimension
  y: Dimension

  layer: Type.LayerRef
  shape: Type.PCBSMTPad["shape"]

  constructor(project_builder: ProjectBuilder) {
    this.project_builder = project_builder
  }

  setProps(props: Type.PCBSMTPad) {}

  setShape(shape: Type.PCBSMTPad["shape"]) {
    if ((this.width || this.height) && shape === "circle") {
      this.radius = this.width || this.height
      this.width = null
      this.height = null
    } else if (shape === "rect" && this.radius) {
      this.radius = this.width
    }
    this.shape = shape
    return this
  }

  setPosition(x: Dimension, y: Dimension) {
    this.x = x
    this.y = y
    return this
  }

  setSize(width_or_radius: Dimension, height?: Dimension) {
    if (this.shape === "rect" && height === undefined) {
      throw new Error("Must set height for rect")
    }
    if (this.shape === "circle") {
      this.radius = width_or_radius
    } else if (this.shape === "rect") {
      this.width = width_or_radius
      this.height = height
    }
    return this
  }

  setRadius(radius: number) {
    this.radius = radius
    return this
  }

  setLayer(layer) {
    if (typeof layer === "string") {
      this.layer = { name: layer }
    } else {
      this.layer = layer
    }
    return this
  }

  async build(bc: Type.BuildContext): Promise<Type.PCBSMTPad[]> {
    if (this.shape === "rect") {
      return [
        {
          type: "pcb_smtpad",
          shape: this.shape,
          x: bc.convert(this.x),
          y: bc.convert(this.y),
          width: bc.convert(this.width),
          height: bc.convert(this.height),
          layer: this.layer,
        },
      ]
    } else if (this.shape === "circle") {
      return [
        {
          type: "pcb_smtpad",
          shape: this.shape,
          x: bc.convert(this.x),
          y: bc.convert(this.y),
          radius: bc.convert(this.radius),
          layer: this.layer,
        },
      ]
    }
  }
}

export const createSMTPadBuilder = (project_builder: ProjectBuilder) => {
  return new SMTPadBuilderClass(project_builder)
}
