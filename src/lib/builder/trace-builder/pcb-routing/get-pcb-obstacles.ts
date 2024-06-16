import type {
  AnySoupElement,
  LayerRef,
  PCBPlatedHole,
  PCBSMTPad,
} from "@tscircuit/soup"

export type PcbObstacle = {
  center: { x: number; y: number }
  width: number
  height: number
  layers: LayerRef[]
}

export const getPcbObstacles = (params: {
  elements: AnySoupElement[]
  pcb_terminal_port_ids: string[]
  obstacle_margin: number
}): PcbObstacle[] => {
  const { elements, pcb_terminal_port_ids, obstacle_margin } = params

  const obstacles: PcbObstacle[] = [
    ...elements
      .filter((elm): elm is PCBSMTPad => elm.type === "pcb_smtpad")
      // Exclude the pads that are connected to the trace
      .filter((elm) => !pcb_terminal_port_ids.includes(elm.pcb_port_id!))
      .map((pad) => {
        if (pad.shape === "rect") {
          return {
            center: { x: pad.x, y: pad.y },
            width: pad.width + obstacle_margin * 2,
            height: pad.height + obstacle_margin * 2,
            layers: [pad.layer],
          }
        } else if (pad.shape === "circle") {
          // TODO support better circle obstacles
          return {
            center: { x: pad.x, y: pad.y },
            width: pad.radius * 2 + obstacle_margin * 2,
            height: pad.radius * 2 + obstacle_margin * 2,
            layers: [pad.layer],
          }
        }
        throw new Error(
          `Invalid pad shape for pcb_smtpad "${(pad as any).shape}"`
        )
      }),
    ...elements
      .filter((elm): elm is PCBPlatedHole => elm.type === "pcb_plated_hole")
      // Exclude the holes that are connected to the trace
      .filter((elm) => !pcb_terminal_port_ids.includes(elm.pcb_port_id!))
      .map((hole) => {
        return {
          center: { x: hole.x, y: hole.y },
          width: hole.outer_diameter + obstacle_margin * 2,
          height: hole.outer_diameter + obstacle_margin * 2,
          layers: hole.layers,
        }
      }),
  ]

  return obstacles
}
