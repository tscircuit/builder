import * as Type from "lib/types"
import {
  createGroupBuilder,
  GroupBuilder,
  GroupBuilderCallback,
  GroupBuilderAddables,
} from "./group-builder"
import { createProjectFromElements } from "../project/create-project-from-elements"
import convertUnits from "convert-units"

export type ProjectBuilder = Omit<GroupBuilder, "add"> & {
  build_context: Type.BuildContext
  getId: (prefix: string) => string
  addGroup: (groupBuilderCallback: GroupBuilderCallback) => ProjectBuilder
  buildProject: () => Promise<Type.Project>
  build(): Promise<Type.AnyElement[]>
  add<T extends keyof GroupBuilderAddables>(
    builder_type: T,
    callback: (builder: ReturnType<GroupBuilderAddables[T]>) => unknown
  ): ProjectBuilder
  createBuildContext: () => Type.BuildContext
}

export const createProjectBuilder = (): ProjectBuilder => {
  const builder: any = createGroupBuilder()
  builder.project_builder = builder
  const idCount = {}
  const resetIdCount = () => Object.keys(idCount).map((k) => (idCount[k] = 0))
  builder.getId = (prefix: string) => {
    idCount[prefix] = idCount[prefix] || 0
    return `${prefix}_${idCount[prefix]++}`
  }
  builder.build_group = builder.build
  builder.createBuildContext = (): Type.BuildContext => ({
    distance_unit: "mm",
    all_copper_layers: ["top", "bottom"],
    convert(v) {
      if (typeof v === "undefined") return undefined
      if (typeof v === "number") return v
      if (v.x !== undefined && v.y !== undefined) {
        return {
          x: this.convert(v.x),
          y: this.convert(v.y),
        }
      }
      const unit_reversed = v
        .split("")
        .reverse()
        .join("")
        .match(/[a-zA-Z]+/)?.[0]
      if (!unit_reversed) {
        throw new Error(`Could not determine unit: ${v}`)
      }
      const unit = unit_reversed.split("").reverse().join("")
      const value = v.slice(0, -unit.length)
      return convertUnits(parseFloat(value)).from(unit).to(this.distance_unit)
    },
    fork(mutation) {
      return { ...this, ...mutation, parent: this }
    },
  })

  builder.build = async () => {
    resetIdCount()
    const build_context = builder.createBuildContext()
    return await builder.build_group(build_context)
  }
  builder.buildProject = async () => {
    const group = await builder.build()
    return createProjectFromElements(group)
  }
  return builder
}
