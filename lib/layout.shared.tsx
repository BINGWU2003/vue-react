import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: appName,
    },
    links: [
      { text: '文档', url: '/docs', active: 'nested-url' },
      { text: '概念速查', url: '/docs#概念速查' },
    ],
  };
}
