import { BuilderInterface } from "../builder-interface"

export interface SilkscreenPathPropsU {}

export interface SilkscreenPathBuilder extends BuilderInterface {
  setProps(props: SilkscreenPathProps): this
}

export class SilkscreenPathBuilderClass implements SilkscreenPathBuilder {}

export const createSilkscreenPathBuilder = () => {}
