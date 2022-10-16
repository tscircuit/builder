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
} from "../group-builder"
import { ProjectBuilder } from "../project-builder"
import {
  ConstraintBuilder,
  ConstraintBuilderFields,
  createConstraintBuilder,
} from "./constraint-builder"
import { applySelector } from "lib/apply-selector"

export interface ConstrainedLayoutBuilder extends GroupBuilder {
  // TODO modify add function
  add(
    builder_type: Parameters<GroupBuilder["add"]>[0] | "constraint",
    callback:
      | Parameters<GroupBuilder["add"]>[1]
      | ((cb: ConstraintBuilder) => unknown)
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
  const w = obj.w || obj.width || 0
  const h = obj.w || obj.width || 0
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
    for (let i = 0; i < spatial_elements.length; i++) {
      if (!spatial_elements[i]) continue
      vars[`elm${i}_x`] = new kiwi.Variable(`elm${i}_x`)
      solver.addEditVariable(vars[`elm${i}_x`], spatial_elements[i].x)
      vars[`elm${i}_y`] = new kiwi.Variable(`elm${i}_y`)
      solver.addEditVariable(vars[`elm${i}_y`], spatial_elements[i].y)
      // vars[`elm${i}_w`] = new kiwi.Variable(`elm${i}_w`)
      // solver.suggestValue(vars[`elm${i}_w`], spatial_elements[i].w)
      // vars[`elm${i}_h`] = new kiwi.Variable(`elm${i}_h`)
      // solver.suggestValue(vars[`elm${i}_h`], spatial_elements[i].h)
    }

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

      const elmi = elements.indexOf(matchingElms[0])
      return {
        X: vars[`elm${elmi}_x`],
        Y: vars[`elm${elmi}_y`],
        w: spatial_elements[elmi].w,
        h: spatial_elements[elmi].h,
        // TODO solve group stuff
        og_elm: matchingElms[0],
        index: elmi,
      }
    }

    for (const constraint of this.constraints) {
      const { props } = constraint
      let A, B

      if (props.a) {
        A = match(props.a)
      }
      if (props.b) {
        B = match(props.b)
      }

      switch (props.type) {
        case "xdist": {
          const lhs = new kiwi.Expression(A.X, A.w / 2, props.dist)
          const rhs = new kiwi.Expression(B.X, -B.w / 2)
          solver.addConstraint(new kiwi.Constraint(lhs, kiwi.Operator.Eq, rhs))
          continue
        }
        case "ydist": {
          const lhs = new kiwi.Expression(A.Y, A.h / 2, props.dist)
          const rhs = new kiwi.Expression(B.Y, -B.h / 2)
          solver.addConstraint(new kiwi.Constraint(lhs, kiwi.Operator.Eq, rhs))
          continue
        }
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
