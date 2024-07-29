import type { AnySoupElement } from "@tscircuit/soup"
import type { ExecutionContext } from "ava"
import test from "ava"
import { createProjectBuilder } from "../../src"
import { logLayout } from "../utils/log-layout"
import { writeSchematicSnapshotPng } from "./schematic-snapshot-output"

/**
 * Consolidates common test functions and components for simpler test definition
 */
export const getTestFixture = (t: ExecutionContext<unknown>) => {
  return {
    logSoup: (soup: AnySoupElement[]) => logLayout(t.title, soup),
    pb: createProjectBuilder(),
    writeSchematicSnapshotPng: (soup: AnySoupElement[]) =>
      writeSchematicSnapshotPng(t.title, soup, test.meta.file),
  }
}
