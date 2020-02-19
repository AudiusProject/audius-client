import preact from "preact";

export abstract class Component<P> {}

declare namespace JSX {
  type Element = preact.JSX.Element;
}

export as namespace JSX

// export as namespace JSX

export {
  Attributes,
  HTMLAttributes,
  FunctionalComponent as SFC,
  AnyComponent as ComponentType,
  AnyComponent as JSXElementConstructor,
  ClassAttributes,
  PreactContext as Context,
  PreactProvider as Provider,
  VNode as ReactElement,
  VNode as ReactNode,
  createElement,
  Ref,
  RenderableProps as ComponentPropsWithRef,
} from "preact";

// export type JSXElementConstructor = AnyComponent;
