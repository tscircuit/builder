import type { AnySoupElement } from "@tscircuit/soup"
import { circuitToPng } from "circuit-to-png"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

export const writeSchematicSnapshotPng = async (
  fileName: string,
  circuit: AnySoupElement[],
  dirName: string
) => {
  const pngBuffer = circuitToPng(circuit, "schematic")
  const fileNameWithoutSpaces = fileName.replaceAll(" ", "-")

  const filePath = fileURLToPath(dirName)
  const directoryPath = path.dirname(filePath)
  const snapshotDir = path.join(directoryPath, "__snapshots__")

  try {
    await mkdir(snapshotDir, { recursive: true })
  } catch (err) {
    if (err.code !== "EEXIST") {
      throw err
    }
  }

  const snapshotPath = path.join(
    snapshotDir,
    `${fileNameWithoutSpaces}-sch.snapshot.png`
  )
  await writeFile(snapshotPath, pngBuffer)
}
