import * as Type from "lib/types"
import { ProjectBuilder } from "lib/project"

export interface SMTPadBuilder {
  builder_type: "smtpad_builder"
  project_builder: ProjectBuilder
  setShape(shape: Type.PCBSMTPad["shape"]): SMTPadBuilder
  setSize(width: number, height: number): SMTPadBuilder
  setRadius(radius: number): SMTPadBuilder
  setLayer(layer: Type.PCBSMTPad["layer"] | string): SMTPadBuilder
  setPosition(x: number, y: number): SMTPadBuilder
  build(): Promise<Type.PCBSMTPad[]>
}

type RectProps = Extract<Type.PCBSMTPad, { shape: "rect" }>
type CircleProps = Extract<Type.PCBSMTPad, { shape: "circle" }>

export class SMTPadBuilderClass implements SMTPadBuilder {
  project_builder: ProjectBuilder
  builder_type = "smtpad_builder" as const

  width: RectProps["width"]
  height: RectProps["height"]
  radius: CircleProps["radius"]
  x: number
  y: number

  layer: Type.LayerRef
  shape: Type.PCBSMTPad["shape"]

  constructor(project_builder: ProjectBuilder) {
    this.project_builder = project_builder
  }

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

  setPosition(x: number, y: number) {
    this.x = x
    this.y = y
    return this
  }

  setSize(width_or_radius: number, height?: number) {
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

  async build(): Promise<Type.PCBSMTPad[]> {
    if (this.shape === "rect") {
      return [
        {
          type: "pcb_smtpad",
          shape: this.shape,
          x: this.x,
          y: this.y,
          width: this.width,
          height: this.height,
          layer: this.layer,
        },
      ]
    } else if (this.shape === "circle") {
      return [
        {
          type: "pcb_smtpad",
          shape: this.shape,
          x: this.x,
          y: this.y,
          radius: this.radius,
          layer: this.layer,
        },
      ]
    }
  }
}

export const createSMTPadBuilder = (project_builder: ProjectBuilder) => {
  return new SMTPadBuilderClass(project_builder)
}
