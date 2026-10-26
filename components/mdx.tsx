import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Demo, CodeOnly } from "./learning/demo";
import { Diagram } from "./learning/diagram";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Demo,
    CodeOnly,
    Diagram,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
