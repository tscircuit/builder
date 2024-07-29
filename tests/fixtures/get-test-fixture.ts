import type { AnySoupElement } from "@tscircuit/soup"
import type { ExecutionContext } from "ava"
import { createProjectBuilder } from "../../src"
import { logLayout } from "../utils/log-layout"
import { schematicSnapshotOutput } from "./schematic-snapshot-output"

/**
 * Consolidates common test functions and components for simpler test definition
 */
export const getTestFixture = (t: ExecutionContext) => {
  return {
    logSoup: (soup: AnySoupElement[]) => logLayout(t.title, soup),
    pb: createProjectBuilder(),
    schematicSnapshot: (soup: AnySoupElement[]) =>
      schematicSnapshotOutput(soup),
  }
}
