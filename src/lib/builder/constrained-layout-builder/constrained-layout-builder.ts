/**
 * A constrained layout builder is used to apply constraints to any set of
 * of elements that implement either { x, y } or { x, y, w, h } (w/ align and
 * other aliases)
 */
import * as Type from "lib/types"
import {
  createGroupBuilder,
  GroupBuilder,
  GroupBuilderCallback,
} from "../group-builder"

export interface ConstrainedLayoutBuilder extends GroupBuilder {}

export class ConstrainedLayoutBuilderClass extends GroupBuilderClass implements ConstrainedLayoutBuilder {

}

export const createConstrainedLayoutBuilder = (): ConstrainedLayoutBuilder => {
  return new 
}
