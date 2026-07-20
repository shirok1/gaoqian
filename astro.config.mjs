// @ts-check

import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import starlightAutoSidebar from "starlight-auto-sidebar";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    starlight({
      title: "搞钱 Wiki",
      description: "面向中国 Z 世代的个人财务中文资料库",
      plugins: [starlightAutoSidebar()],
      defaultLocale: "root",
      locales: {
        root: { label: "简体中文", lang: "zh-CN" },
      },
      customCss: ["./src/styles/global.css"],
      components: {
        MarkdownContent: "./src/components/overrides/MarkdownContent.astro",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/shirok1/gaoqian",
        },
      ],
      sidebar: [
        {
          label: "开始",
          items: [
            { label: "从这里开始", link: "/getting-started/overview/" },
            { label: "如何查找资料", link: "/getting-started/how-to-use/" },
          ],
        },
        {
          label: "收入与税",
          items: [{ autogenerate: { directory: "salary" } }],
        },
        {
          label: "预算与现金流",
          items: [{ autogenerate: { directory: "money-management" } }],
        },
        {
          label: "银行与储蓄",
          items: [{ autogenerate: { directory: "banking" } }],
        },
        {
          label: "债务",
          items: [{ autogenerate: { directory: "debt" } }],
        },
        {
          label: "信用卡",
          items: [
            {
              label: "选择信用卡",
              items: [{ autogenerate: { directory: "cards/choosing" } }],
            },
            {
              label: "管理信用卡",
              items: [{ autogenerate: { directory: "cards/using" } }],
            },
            {
              label: "信用卡资料库",
              items: [
                { label: "浏览全部信用卡", link: "/cards/db/" },
                { autogenerate: { directory: "cards/db" } },
              ],
            },
          ],
        },
        {
          label: "保险",
          items: [{ autogenerate: { directory: "insurance" } }],
        },
        {
          label: "住房",
          items: [{ autogenerate: { directory: "housing" } }],
        },
        {
          label: "家庭财务",
          items: [{ autogenerate: { directory: "family" } }],
        },
        {
          label: "投资",
          items: [
            {
              label: "基础",
              items: [{ autogenerate: { directory: "investing/basics" } }],
            },
            {
              label: "基金",
              items: [{ autogenerate: { directory: "investing/funds" } }],
            },
            {
              label: "工具",
              items: [{ autogenerate: { directory: "investing/tools" } }],
            },
            {
              label: "个股",
              items: [{ autogenerate: { directory: "investing/stocks" } }],
            },
            {
              label: "券商资料库",
              items: [
                { label: "浏览全部券商", link: "/brokers/db/" },
                { autogenerate: { directory: "brokers" } },
              ],
            },
          ],
        },
        {
          label: "跨境用钱",
          items: [{ autogenerate: { directory: "cross-border" } }],
        },
        {
          label: "避坑",
          items: [{ autogenerate: { directory: "pitfalls" } }],
        },
      ],
    }),
    react(),
  ],

  adapter: cloudflare({
    imageService: { build: "compile", runtime: "passthrough" },
  }),
});
