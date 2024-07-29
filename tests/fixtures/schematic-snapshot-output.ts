import type { AnySoupElement } from "@tscircuit/soup"
import { circuitToPng } from "circuit-to-png"
import { writeFile } from "node:fs/promises"
import path from "node:path"

export const schematicSnapshotOutput = async (
  fileName: string,
  circuit: AnySoupElement[]
) => {
  const pngBuffer = circuitToPng(circuit, "schematic")
  const snapshotDir = path.join(
    path.dirname(__dirname),
    "__snapshots__"
  )
  const fileNameWithoutSpaces = fileName.replaceAll(" ", "-")
  const snapshotPath = path.join(snapshotDir, `${fileNameWithoutSpaces}.snapshot.png`)
  await writeFile(snapshotPath, pngBuffer)
}
