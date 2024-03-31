import { ExecutionContext } from "ava"
import { createProjectBuilder } from "../../src"
import { logLayout } from "../utils/log-layout"

/**
 * Consolidates common test functions and components for simpler test definition
 */
export const getTestFixture = (t: ExecutionContext) => {
  return {
    logSoup: (soup: any) => logLayout(t.title, soup),
    pb: createProjectBuilder(),
  }
}
