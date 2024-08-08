import test from "ava";
import { getTestFixture } from "../fixtures/get-test-fixture"; 

test("replicate duplicate port hints issue", async (t) => {
  try {
    const { logSoup, pb } = await getTestFixture(t);

    const soup = await pb
      .add("bug", (cb) => {
        cb.setProps({ footprint: "soic8" });
      })
      .build();

    const su = require("@tscircuit/soup-util");

    const sourcePorts = su(soup).source_port.list();

    sourcePorts.forEach((port) => {
      const portHintsSet = new Set(port.port_hints);

      t.is(
        port.port_hints.length,
        portHintsSet.size,
        `Duplicate hints found in port ${port.name}`
      );
    });

    await logSoup(soup);
  } catch (error) {
    console.error("Error in test:", error);
    t.fail(`Test failed due to error: ${error.message}`);
  }
});