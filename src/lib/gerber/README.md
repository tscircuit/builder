# Gerber Stringification

Some components of this gerber system:

- A JSON command representation (defined in part with zod), all gerber command
  definitions are in [./commands](./commands)
  - Each command features a stringification function
- A function that converts soup to the Gerber commands [./convert-soup-to-gerber-commands](./convert-soup-to-gerber-commands)

## References

- [Gerber Format Specification (2022)](https://www.ucamco.com/files/downloads/file_en/456/gerber-layer-format-specification-revision-2022-02_en.pdf?7b3ca7f0753aa2d77f5f9afe31b9f826)
