// @ts-ignore
import fs from "node:fs"
const randomString = () => Math.random().toString(36).substring(2, 15)
globalThis.logTmpFile = (prefix, obj) => {
  fs.mkdirSync("./tmp-debug-logs", { recursive: true })
  const filePath = `./tmp-debug-logs/${prefix}-${Date.now()}-${randomString()}.json`
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2))
  console.log(`Wrote debug log to ${filePath}`)
}
