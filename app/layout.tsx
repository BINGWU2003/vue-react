import { RootProvider } from "fumadocs-ui/provider/next";
import "./global.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { appName } from "@/lib/shared";
import { zhTranslations } from "@/lib/translations";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description:
    "面向 Vue 开发者的 React 19 对照文档：11 章正文、TypeScript 对照代码、交互示例和更新机制流程图。",
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider i18n={{ locale: "zh-CN", translations: zhTranslations }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
