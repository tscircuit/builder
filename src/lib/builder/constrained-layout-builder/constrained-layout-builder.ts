/**
 * A constrained layout builder is used to apply constraints to any set of
 * of elements that implement either { x, y } or { x, y, w, h } (w/ align and
 * other aliases)
 */
import * as Type from "lib/types"
import * as kiwi from "@lume/kiwi"

import {
  createGroupBuilder,
  GroupBuilder,
  GroupBuilderCallback,
  GroupBuilderClass,
  GroupBuilderAddables,
  getGroupAddables,
} from "../group-builder"
import { ProjectBuilder } from "../project-builder"
import {
  ConstraintBuilder,
  ConstraintBuilderFields,
  createConstraintBuilder,
} from "./constraint-builder"
import { applySelector } from "lib/apply-selector"
import {
  getElementChildren,
  getSpatialElementIncludingChildren,
} from "./spatial-util"
import { combined } from "lib/utils/combined"

const constraint_builder_addables = {
  ...getGroupAddables(),
  constraint: createConstraintBuilder,
}

export interface ConstrainedLayoutBuilder
  extends Omit<GroupBuilder, "add" | "appendChild"> {
  add<T extends keyof typeof constraint_builder_addables>(
    builder_type: T,
    callback: (
      builder: ReturnType<(typeof constraint_builder_addables)[T]>
    ) => unknown
  ): ConstrainedLayoutBuilder
  appendChild(
    child: Parameters<GroupBuilder["appendChild"]>[0] | ConstraintBuilder
  ): ConstrainedLayoutBuilder
  addConstraint(props: ConstraintBuilderFields): ConstrainedLayoutBuilder
}

export const constrainable_element_types = [
  "pcb_component",
  "schematic_component",
] as const

export const moveElementTo = (
  elements: Type.AnyElement[],
  ind: number,
  dx: number,
  dy: number
) => {
  const elm = elements[ind]
  if (elm.type === "schematic_component") {
    elm.center.x += dx
    elm.center.y += dy
  } else if (elm.type === "pcb_component") {
    const children = getElementChildren(elements[ind], elements)
    // TODO do recursive method...
    for (const child of children) {
      if ("x" in child) {
        child.x += dx
        child.y += dy
      }
    }
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

  async build(bc): Promise<Type.AnyElement[]> {
    const elements: Type.AnyElement[] = await super.build(bc)

    // TODO solve groups when all subpositions have been solved, constraints
    // should be applied to the entire solve group

    const solver = new kiwi.Solver()

    const spatial_elements = elements.map((elm) => {
      if (!constrainable_element_types.includes(elm.type as any)) return null
      const spatial_elm = getSpatialElementIncludingChildren(elm, elements)
      return spatial_elm
    })
    const vars = {}

    // TODO limit to components mentioned in constraints?
    for (let i = 0; i < spatial_elements.length; i++) {
      const spatial_element = spatial_elements[i]
      if (!spatial_element) continue
      vars[`elm${i}_x`] = new kiwi.Variable(`elm${i}_x`)
      solver.addEditVariable(vars[`elm${i}_x`], kiwi.Strength.weak)
      solver.suggestValue(vars[`elm${i}_x`], spatial_element.x)
      vars[`elm${i}_y`] = new kiwi.Variable(`elm${i}_y`)
      solver.addEditVariable(vars[`elm${i}_y`], kiwi.Strength.weak)
      // solver.suggestValue(vars[`elm${i}_y`], spatial_element.y)

      // vars[`elm${i}_w`] = new kiwi.Variable(`elm${i}_w`)
      // solver.suggestValue(vars[`elm${i}_w`], spatial_elements[i].w)
      // vars[`elm${i}_h`] = new kiwi.Variable(`elm${i}_h`)
      // solver.suggestValue(vars[`elm${i}_h`], spatial_elements[i].h)
    }

    const pb = this.project_builder
    function match(selector, target_type: "schematic" | "pcb") {
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

      if (elm.type === "source_component") {
        const { source_component_id } = elm
        const associated_components = elements.filter(
          (e) => combined(e).source_component_id === source_component_id
        )
        if (target_type === "schematic") {
          elm = associated_components.find(
            (c) => c.type === "schematic_component"
          )!
        } else if (target_type === "pcb") {
          elm = associated_components.find((c) => c.type === "pcb_component")!
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
      const target_type = props.schematic ? "schematic" : "pcb"
      switch (props.type) {
        case "xdist": {
          const A = match(props.left, target_type)
          const B = match(props.right, target_type)
          const lhs = new kiwi.Expression(A.X, A.w! / 2, props.dist)
          const rhs = new kiwi.Expression(B.X, -B.w! / 2)
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
              (A.x! + B.x!) / 2,
              kiwi.Strength.weak
            )
          )

          continue
        }
        case "ydist": {
          const A = match(props.bottom, target_type)
          const B = match(props.top, target_type)
          const lhs = new kiwi.Expression(A.Y, A.h! / 2, props.dist)
          const rhs = new kiwi.Expression(B.Y, -B.h! / 2)
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
              (A.y! + B.y!) / 2,
              kiwi.Strength.weak
            )
          )
          continue
        }
      }
    }

    solver.updateVariables()

    for (let i = 0; i < spatial_elements.length; i++) {
      const spatial_element = spatial_elements[i]
      if (!spatial_element) continue
      const new_x = vars[`elm${i}_x`].value()
      const new_y = vars[`elm${i}_y`].value()
      const old_x = spatial_element.x
      const old_y = spatial_element.y
      const changed = new_x !== old_x || new_y !== old_y

      if (changed) {
        moveElementTo(elements, i, new_x - old_x, new_y - old_y)
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
