import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/docs/topics', destination: '/docs', permanent: true },
      { source: '/docs/notes', destination: '/docs', permanent: true },
    ];
  },
};

export default withMDX(config);
