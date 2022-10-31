import * as Type from "lib/types"
import {
  createGroupBuilder,
  GroupBuilder,
  GroupBuilderCallback,
  group_builder_addables,
} from "./group-builder"
import { GenericComponentBuilderCallback } from "./component-builder"
import { createProjectFromElements } from "../project/create-project-from-elements"
import { TraceBuilderCallback } from "./trace-builder"
import convertUnits from "convert-units"

export type ProjectBuilder = Omit<GroupBuilder, 'add'> & {
  build_context: Type.BuildContext
  getId: (prefix: string) => string
  addGroup: (groupBuilderCallback: GroupBuilderCallback) => ProjectBuilder
  buildProject: () => Promise<Type.Project>
  build(): Promise<Type.AnyElement[]>
  add<T extends keyof typeof group_builder_addables>(
    builder_type: T,
    callback: (builder: ReturnType<typeof group_builder_addables[T]>) => unknown
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
  builder.createBuildContext = () => ({
    distance_unit: "mm",
    convert(v: Type.NumberWithAnyUnit) {
      if (typeof v === "number") return v
      const [_, value, unit] = v.match(/([0-9.]+)([a-zA-Z]+)/)
      return convertUnits(parseFloat(value)).from(unit).to(this.distance_unit)
    } 
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
