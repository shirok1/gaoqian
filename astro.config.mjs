// @ts-check

import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightAutoSidebar from "starlight-auto-sidebar";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "搞钱 Wiki",
      description: "信用卡与投资的中文资料库",
      plugins: [starlightAutoSidebar()],
      defaultLocale: "root",
      locales: {
        root: { label: "简体中文", lang: "zh-CN" },
      },
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
          items: [{ autogenerate: { directory: "getting-started" } }],
        },
        {
          label: "信用卡",
          items: [
            {
              label: "选卡",
              items: [{ autogenerate: { directory: "cards/choosing" } }],
            },
            {
              label: "用卡",
              items: [{ autogenerate: { directory: "cards/using" } }],
            },
            {
              label: "卡",
              items: [
                { label: "目录", link: "/cards/db/" },
                { autogenerate: { directory: "cards/db" } },
              ],
            },
          ],
        },
        {
          label: "投资",
          items: [
            {
              label: "基础",
              items: [{ autogenerate: { directory: "investing/basics" } }],
            },
            {
              label: "券商",
              items: [
                { label: "目录", link: "/brokers/db/" },
                { autogenerate: { directory: "brokers" } },
              ],
            },
          ],
        },
      ],
    }),
    react(),
  ],

  adapter: cloudflare({
    imageService: { build: "compile", runtime: "passthrough" },
  }),
});
