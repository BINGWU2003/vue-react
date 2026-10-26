import { defineConfig } from 'fumadocs-mdx/config';
import { remarkInclude } from 'fumadocs-core/mdx-plugins';

export default defineConfig({
  mdxOptions: {
    remarkPlugins: (plugins) => [remarkInclude, ...plugins],
  },
});
