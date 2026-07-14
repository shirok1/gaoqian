import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { z } from "astro/zod";
import { autoSidebarLoader } from "starlight-auto-sidebar/loader";
import { autoSidebarSchema } from "starlight-auto-sidebar/schema";

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: () =>
        z.object({
          // Discriminates entity detail pages from plain guide pages.
          // Guides leave this undefined and get no spec table.
          kind: z.enum(["card", "broker"]).optional(),

          // --- 信用卡 ---
          bank: z.string().optional(),
          network: z
            .enum(["银联", "Visa", "Mastercard", "双标", "美国运通", "JCB"])
            .optional(),
          cardType: z.enum(["信用卡", "借记卡", "联名卡"]).optional(),
          cardLevel: z.string().optional(),
          annualFee: z
            .object({
              amount: z.number(),
              currency: z.enum(["CNY", "HKD", "USD"]).default("CNY"),
              waiver: z.string().optional(),
            })
            .optional(),
          cashbackRate: z.number().nullable().optional(),
          pointsPerYuan: z.number().nullable().optional(),
          perks: z.string().array().default([]),
          targetGroupCard: z
            .enum(["学生", "新手", "上班族", "商旅", "网购"])
            .optional(),
          difficulty: z.enum(["易", "中", "难"]).optional(),

          // --- 券商 ---
          accountTypes: z
            .enum(["A股", "港股", "美股", "基金", "债券"])
            .array()
            .default([]),
          commissionRate: z.number().optional(),
          minCommission: z.number().optional(),
          platformFee: z.number().nullable().optional(),
          features: z.string().array().default([]),
          appExperience: z.enum(["优", "良", "一般"]).optional(),
          supportChannels: z.string().array().default([]),
          minDeposit: z.number().nullable().optional(),
          pensionSupported: z.boolean().optional(),
          targetGroupBroker: z
            .enum(["新手", "进阶", "高频", "长期持有"])
            .optional(),
        }),
    }),
  }),

  // Consumed by starlight-auto-sidebar's middleware, not by our own code.
  // The collection name must be exactly `autoSidebar`.
  autoSidebar: defineCollection({
    loader: autoSidebarLoader(),
    schema: autoSidebarSchema(),
  }),
};
