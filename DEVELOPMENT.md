# Development Guide

`@tscircuit/builder` is a core library where essentially "all the tscircuit modules" are combined
together to produce [tscircuit soup json](https://github.com/tscircuit/soup) as well as convert
to various industry file formats needed for making electronics.

It is also the oldest repo and pretty messy. We're actively working to refactor the builder and
replace some big parts of it with separate modules. Until that's done, it's just something
we have to deal with!

The builder is a library with a ton of tests, you can't "run the builder" but it's in the
background building circuits for you when you use `tsci dev`.

When you're improving/fixing a bug in builder, you'll generally pick a test or create a new
test. Every test looks the same:

```ts
import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("something i want to test", async (t) => {
  const { logSoup, pb } = await getTestServer(t)

  // Customize this part, use the builder to make some soup!
  // The syntax sucks but it's similar to the react code
  const soup = await pb
    .add("resistor", (rb) =>
      rb.setProps({ resistance: "10k", footprint: "0402" }),
    )
    .build()

  // OPTIONAL: It's usually a good idea to have some kind of regression test, you can use
  // "su" from "@tscircuit/soup-util" to quickly check the soup for elements
  // t.is(su(soup).source_resistor.list().length, 1)

  // IMPORTANT! This will log the soup so you can _visually view the footprint_ on debug.tscircuit.com
  await logSoup(soup)
})
```

To run the test, you use this command:

```bash
npx ava ./path/to/test.test.ts
```

## Doing an Issue Guide

1. Pick a test or create a new test that replicates a bug/tests a new feature
2. Keep running that `npx ava ./path/to/test.test.ts` command until everything looks right/passes
3. Create a PR for your change
