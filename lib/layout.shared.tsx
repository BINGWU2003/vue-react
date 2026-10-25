import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: appName,
    },
    links: [
      { text: '文档', url: '/docs', active: 'nested-url' },
      { text: '灵感记录', url: '/docs/notes' },
    ],
  };
}
