export type PcbSolverGrid = {
  marginSegments: number
  maxGranularSearchSegments: number
  segmentSize: number
}

export const default_pcb_solver_grid: PcbSolverGrid = {
  marginSegments: 20,
  maxGranularSearchSegments: 50,
  segmentSize: 0.2, // mm
}
