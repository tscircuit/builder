import type { AnySoupElement } from "@tscircuit/soup"
import { circuitToPng } from "circuit-to-png"
import { writeFile } from "node:fs/promises"

export const schematicSnapshotOutput = async (circuit: AnySoupElement[]) => {
  const pngBuffer = circuitToPng(circuit, "schematic")
  const outputPath = "./schematic-snapshot.png"
  await writeFile(outputPath, pngBuffer)
}
