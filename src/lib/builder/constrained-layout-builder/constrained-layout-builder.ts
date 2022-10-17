/**
 * A constrained layout builder is used to apply constraints to any set of
 * of elements that implement either { x, y } or { x, y, w, h } (w/ align and
 * other aliases)
 */
import * as Type from "lib/types"
import * as kiwi from "@lume/kiwi"
import * as CB from "../component-builder"

import {
  createGroupBuilder,
  GroupBuilder,
  GroupBuilderCallback,
  GroupBuilderClass,
  group_builder_addables,
} from "../group-builder"
import { ProjectBuilder } from "../project-builder"
import {
  ConstraintBuilder,
  ConstraintBuilderFields,
  createConstraintBuilder,
} from "./constraint-builder"
import { applySelector } from "lib/apply-selector"

const constraint_builder_addables = {
  ...group_builder_addables,
  constraint: createConstraintBuilder,
}

export interface ConstrainedLayoutBuilder extends GroupBuilder {
  add<T extends keyof typeof constraint_builder_addables>(
    builder_type: T,
    callback: (
      builder: ReturnType<typeof constraint_builder_addables[T]>
    ) => unknown
  ): ConstrainedLayoutBuilder
  appendChild(
    child: Parameters<GroupBuilder["appendChild"]>[0] | ConstraintBuilder
  ): ConstrainedLayoutBuilder
  addConstraint(props: ConstraintBuilderFields): ConstrainedLayoutBuilder
}

export const toCenteredSpatialObj = (
  obj: any
): { x: number; y: number; w: number; h: number } => {
  const x = obj.x || obj.center?.x
  const y = obj.y || obj.center?.y
  const w = obj.w || obj.width || obj.size?.width || 0
  const h = obj.h || obj.height || obj.size?.height || 0
  const align = obj.align || "center"
  if (x === undefined || y === undefined) {
    throw new Error(
      `Cannot convert to spatial obj (no x,y): ${JSON.stringify(
        obj,
        null,
        "  "
      )}`
    )
  }
  if (align !== "center") {
    throw new Error(
      `Cannot convert to spatial obj (align not center not implemented): ${JSON.stringify(
        obj,
        null,
        "  "
      )}`
    )
  }

  return { x, y, w, h }
}

export const moveElementTo = (
  elements: Type.AnyElement[],
  ind: number,
  x: number,
  y: number
) => {
  const elm = elements[ind]
  if (elm.type === "schematic_component") {
    elm.center.x = x
    elm.center.y = y
  } else {
    throw new Error(
      `Not sure how to move element of type "${elm.type}" (in constrained layout builder)`
    )
  }
}

export class ConstrainedLayoutBuilderClass
  extends GroupBuilderClass
  implements ConstrainedLayoutBuilder
{
  constraints: ConstraintBuilder[] = []

  add(builder_type, callback) {
    if (builder_type === "constraint_builder") {
      const constraint = createConstraintBuilder(this.project_builder)
      callback(constraint)
      this.constraints.push(constraint)
      return this
    }
    super.add(builder_type, callback)
    return this
  }

  addConstraint(props) {
    const constraint = createConstraintBuilder(this.project_builder)
    constraint.setProps(props)
    this.constraints.push(constraint)
    return this
  }

  appendChild(child) {
    if (child.builder_type === "constraint_builder") {
      this.constraints.push(child)
      return this
    }
    super.appendChild(child)
    return this
  }

  async build() {
    const elements = await super.build()

    // TODO solve groups when all subpositions have been solved, constraints
    // should be applied to the entire solve group

    const solver = new kiwi.Solver()

    const spatial_elements = elements.map((elm) => {
      try {
        const spatial_elm = toCenteredSpatialObj(elm)
        return spatial_elm
      } catch (e) {
        return null
      }
    })
    const vars = {}

    // TODO limit to components mentioned in constraints?
    for (let i = 0; i < spatial_elements.length; i++) {
      if (!spatial_elements[i]) continue
      vars[`elm${i}_x`] = new kiwi.Variable(`elm${i}_x`)
      solver.addEditVariable(vars[`elm${i}_x`], kiwi.Strength.weak)
      solver.suggestValue(vars[`elm${i}_x`], spatial_elements[i].x)
      vars[`elm${i}_y`] = new kiwi.Variable(`elm${i}_y`)
      solver.addEditVariable(vars[`elm${i}_y`], kiwi.Strength.weak)
      // vars[`elm${i}_w`] = new kiwi.Variable(`elm${i}_w`)
      // solver.suggestValue(vars[`elm${i}_w`], spatial_elements[i].w)
      // vars[`elm${i}_h`] = new kiwi.Variable(`elm${i}_h`)
      // solver.suggestValue(vars[`elm${i}_h`], spatial_elements[i].h)
    }

    const pb = this.project_builder
    function match(selector) {
      const matchingElms = applySelector(elements, selector)
      if (matchingElms.length > 1)
        throw new Error(
          `Multiple elements match selector: "${selector}" (${JSON.stringify(
            matchingElms,
            null,
            "  "
          )})`
        )
      if (matchingElms.length === 0)
        throw new Error(`No elements match selector: "${selector}"`)

      let elm = matchingElms[0]

      // TODO if schematic context, use schematic position
      // TODO if pcb context, use pcb position
      if (elm.type === "source_component") {
        const { source_component_id } = elm
        const associated_components = elements.filter(
          (e) => e.source_component_id === source_component_id
        )
        const schematic_component = associated_components.find(
          (c) => c.type === "schematic_component"
        )
        if (schematic_component) {
          elm = schematic_component
        } else {
          throw new Error(
            `Unable to properly associate component for constraint solving "${JSON.stringify(
              elm,
              null,
              "  "
            )}"`
          )
        }
      }

      const elmi = elements.indexOf(elm)

      return {
        X: vars[`elm${elmi}_x`],
        Y: vars[`elm${elmi}_y`],
        x: spatial_elements[elmi]?.x,
        y: spatial_elements[elmi]?.y,
        w: spatial_elements[elmi]?.w,
        h: spatial_elements[elmi]?.h,
        // TODO solve group stuff
        og_elm: matchingElms[0],
        index: elmi,
      }
    }

    for (const constraint of this.constraints) {
      const { props } = constraint
      switch (props.type) {
        case "xdist": {
          const A = match(props.left)
          const B = match(props.right)
          const lhs = new kiwi.Expression(A.X, A.w / 2, props.dist)
          const rhs = new kiwi.Expression(B.X, -B.w / 2)
          solver.addConstraint(
            new kiwi.Constraint(
              lhs,
              kiwi.Operator.Eq,
              rhs,
              kiwi.Strength.strong
            )
          )

          // weak constraint to have these components meet in the middle
          solver.addConstraint(
            new kiwi.Constraint(
              new kiwi.Expression([0.5, A.X], [0.5, B.X]),
              kiwi.Operator.Eq,
              (A.x + B.x) / 2,
              kiwi.Strength.weak
            )
          )

          continue
        }
        case "ydist": {
          const A = match(props.bottom)
          const B = match(props.top)
          const lhs = new kiwi.Expression(A.Y, A.h / 2, props.dist)
          const rhs = new kiwi.Expression(B.Y, -B.h / 2)
          solver.addConstraint(
            new kiwi.Constraint(
              lhs,
              kiwi.Operator.Eq,
              rhs,
              kiwi.Strength.strong
            )
          )

          // weak constraint to have these components meet in the middle
          solver.addConstraint(
            new kiwi.Constraint(
              new kiwi.Expression([0.5, A.Y], [0.5, B.Y]),
              kiwi.Operator.Eq,
              (A.y + B.y) / 2,
              kiwi.Strength.weak
            )
          )
          continue
        }
      }
    }

    solver.updateVariables()

    for (let i = 0; i < spatial_elements.length; i++) {
      if (!spatial_elements[i]) continue
      const new_x = vars[`elm${i}_x`].value()
      const new_y = vars[`elm${i}_y`].value()
      const changed =
        new_x !== spatial_elements[i].x || new_y !== spatial_elements[i].y

      if (changed) {
        moveElementTo(elements, i, new_x, new_y)
      }
    }

    return elements
  }
}

export const createConstrainedLayoutBuilder = (
  project_builder: ProjectBuilder
): ConstrainedLayoutBuilder => {
  return new ConstrainedLayoutBuilderClass(project_builder)
}
