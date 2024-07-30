import type { AnySoupElement } from "@tscircuit/soup"
import { circuitToPng } from "circuit-to-png"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

export const writeSchematicSnapshotPng = async (
  fileName: string,
  circuit: AnySoupElement[],
  dirName: string
) => {
  const pngBuffer = circuitToPng(circuit, "schematic")
  const fileNameWithoutSpaces = fileName.replaceAll(" ", "-")
  const directoryPath = dirName
    .split(`/${fileNameWithoutSpaces}`)[0]
    .replace(/^file:\/\//, "")
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
