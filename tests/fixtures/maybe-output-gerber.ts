export const maybeOutputGerber = async (gerber_map: Record<string, string>) => {
  // @ts-ignore
  if (process.env.OUTPUT_GERBER) {
    // @ts-ignore
    const fs = await import("fs")
    fs.mkdirSync("./gerber-output", { recursive: true })
    for (const filename of Object.keys(gerber_map)) {
      const fp = `./gerber-output/${filename}.gbr`
      // console.log(`Writing ${fp}`)
      fs.writeFileSync(fp, gerber_map[filename])
    }
  }
}
