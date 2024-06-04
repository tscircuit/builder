# @tscircuit/builder

[Docs](https://tscircuit.github.io/builder) &middot; [Github](https://github.com/tscircuit/builder) &middot; [tscircuit](https://tscircuit.com)

TSCircuit Builder is a Typescript builder pattern for constructing schematic and PCB layouts. `@tscircuit/builder` is an internal module, [use tscircuit tsx instead](https://github.com/tscircuit/tscircuit). The builder is basically "the DOM for building circuits"

TSCircuit TSX eventually renders to a builder. The builder will build
TSCircuit Soup, a JSON output. Soup can be rendered to
a webpage as either a schematic or PCB layout.

> Why not go directly from TSX -> Schematic/PCB?
>
> If you think about how React works, there's a layer between React and
> the rendered HTML image you see on your screen, that layer is the DOM.
> The DOM simplifies the amount of work React has to do. In the same way,
> the Builder simplifies the amount of work that the TSCircuit TSX
> have to do while providing a lot of flexibility for different renderers. It's
> like the DOM for Circuits.

## Example

```ts
const projectBuilder = await createProjectBuilder()
  .addResistor((rb) =>
    rb
      .setSourceProperties({
        resistance: "10 ohm",
        name: "R1",
      })
      .setSchematicCenter(2, 1)
  )

const projectBuilderOutput = await projectBuilder.build()


/*
// Soup JSON, very verbose! Looks easy to render though!
[
  {
    ftype: 'simple_resistor',
    name: 'R1',
    resistance: '10 ohm',
    source_component_id: 'simple_resistor_0',
    type: 'source_component',
  },
  {
    center: {
      x: 2,
      y: 1,
    },
    rotation: 0,
    schematic_component_id: 'schematic_component_simple_resistor_0',
    size: {
      height: 0.3,
      width: 1,
    },
    source_component_id: 'simple_resistor_0',
    type: 'schematic_component',
  },
  ...
]
```

## Installation

```bash
npm install --save @tscircuit/builder
```
