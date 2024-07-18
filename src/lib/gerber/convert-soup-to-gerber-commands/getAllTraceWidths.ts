import type { AnySoupElement, LayerRef, PCBTrace } from "@tscircuit/soup"

export function getAllTraceWidths(
  soup: AnySoupElement[]
): Record<LayerRef, number[]> {
  const pcb_traces = soup.filter(
    (elm): elm is PCBTrace => elm.type === "pcb_trace"
  )

  const widths: Record<LayerRef, Set<number>> = {} as any

  for (const trace of pcb_traces) {
    for (const segment of trace.route) {
      if (segment.route_type === "wire") {
        widths[segment.layer] = widths[segment.layer] || new Set<number>()
        widths[segment.layer].add(segment.width)
      }
    }
  }

  return {
    top: Array.from(widths.top || []),
    bottom: Array.from(widths.bottom || []),
  } as any
}
