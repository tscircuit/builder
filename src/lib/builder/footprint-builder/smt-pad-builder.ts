import * as Type from "lib/types"
import { ProjectBuilder } from "lib/project"
import { Dimension } from "lib/types"

type RectProps = Extract<Type.PCBSMTPad, { shape: "rect" }>
type CircleProps = Extract<Type.PCBSMTPad, { shape: "circle" }>

type InputProps =
  | Omit<
      RectProps,
      "type" | "pcb_component_id" | "pcb_port_id" | "pcb_smtpad_id"
    >
  | Omit<
      CircleProps,
      "type" | "pcb_component_id" | "pcb_port_id" | "pcb_smtpad_id"
    >

export interface SMTPadBuilder {
  builder_type: "smtpad_builder"
  project_builder: ProjectBuilder
  port_hints: string[]
  setShape(shape: Type.PCBSMTPad["shape"]): SMTPadBuilder
  setSize(width: number, height: number): SMTPadBuilder
  setRadius(radius: number): SMTPadBuilder
  setLayer(layer: Type.PCBSMTPad["layer"] | string): SMTPadBuilder
  setPosition(x: number, y: number): SMTPadBuilder
  setProps(props: InputProps): SMTPadBuilder
  addPortHints(port_hints: string[]): SMTPadBuilder
  setPortHints(port_hints: string[]): SMTPadBuilder
  build(bc: Type.BuildContext): Promise<Type.PCBSMTPad[]>
}

export class SMTPadBuilderClass implements SMTPadBuilder {
  project_builder: ProjectBuilder
  builder_type = "smtpad_builder" as const

  width: Dimension | null
  height: Dimension | null
  radius: Dimension | null
  x: Dimension
  y: Dimension
  port_hints: string[]

  layer: Type.LayerRef
  shape: Type.PCBSMTPad["shape"]

  constructor(project_builder: ProjectBuilder) {
    this.project_builder = project_builder
    this.port_hints = []
  }

  setProps(props: InputProps) {
    for (const k in props) {
      this[k] = props[k]
    }
    return this
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
    } else if (this.shape === "rect" && height !== undefined) {
      this.width = width_or_radius
      this.height = height
    } else {
      throw new Error(
        `Invalid parameters for setting size of "${this.shape}", maybe you forgot to provide the height?`
      )
    }
    return this
  }

  setRadius(radius: number) {
    this.radius = radius
    return this
  }

  setLayer(layer) {
    if (typeof layer === "string") {
      this.layer = layer as any
    } else {
      this.layer = layer
    }
    return this
  }

  addPortHints(port_hints: string[]) {
    this.port_hints = this.port_hints.concat(port_hints)
    return this
  }

  setPortHints(port_hints: string[]) {
    this.port_hints = port_hints
    return this
  }

  async build(bc: Type.BuildContext): Promise<Type.PCBSMTPad[]> {
    const pcb_smtpad_id = this.project_builder.getId("pcb_smtpad")
    if (this.shape === "rect") {
      return [
        {
          type: "pcb_smtpad",
          pcb_smtpad_id,
          shape: this.shape,
          x: bc.convert(this.x),
          y: bc.convert(this.y),
          width: bc.convert(this.width!),
          height: bc.convert(this.height!),
          layer: this.layer,
          pcb_component_id: bc.pcb_component_id,
          port_hints: this.port_hints,
        },
      ]
    } else if (this.shape === "circle") {
      return [
        {
          type: "pcb_smtpad",
          pcb_smtpad_id,
          shape: this.shape,
          x: bc.convert(this.x),
          y: bc.convert(this.y),
          radius: bc.convert(this.radius!),
          layer: this.layer,
          pcb_component_id: bc.pcb_component_id,
          port_hints: this.port_hints,
        },
      ]
    }
    throw new Error(`Invalid shape "${this.shape}"`)
  }
}

export const createSMTPadBuilder = (project_builder: ProjectBuilder) => {
  return new SMTPadBuilderClass(project_builder)
}
