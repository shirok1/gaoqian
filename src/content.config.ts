import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { z } from "astro/zod";
import { autoSidebarLoader } from "starlight-auto-sidebar/loader";
import { autoSidebarSchema } from "starlight-auto-sidebar/schema";

const currencySchema = z.enum(["CNY", "HKD", "USD"]);

const moneySchema = z.object({
  amount: z.number().nonnegative(),
  currency: currencySchema,
});

const brokerFeeComponentSchema = z
  .discriminatedUnion("unit", [
    z.object({
      unit: z.enum(["per_order", "per_share", "per_contract"]),
      amount: z.number().nonnegative(),
      currency: currencySchema,
      minimum: moneySchema.optional(),
      maximum: moneySchema.optional(),
      note: z.string().optional(),
    }),
    z.object({
      unit: z.literal("trade_value_percent"),
      amount: z.number().nonnegative().max(100),
      currency: z.never().optional(),
      minimum: moneySchema.optional(),
      maximum: moneySchema.optional(),
      note: z.string().optional(),
    }),
    z.object({
      unit: z.literal("trade_value_basis_points"),
      amount: z.number().nonnegative().max(10_000),
      currency: z.never().optional(),
      minimum: moneySchema.optional(),
      maximum: moneySchema.optional(),
      note: z.string().optional(),
    }),
  ])
  .superRefine((fee, context) => {
    if (
      "currency" in fee &&
      fee.currency &&
      fee.minimum?.currency !== undefined &&
      fee.minimum.currency !== fee.currency
    ) {
      context.addIssue({
        code: "custom",
        path: ["minimum", "currency"],
        message: "最低费用币种必须与费用币种一致",
      });
    }
    if (
      "currency" in fee &&
      fee.currency &&
      fee.maximum?.currency !== undefined &&
      fee.maximum.currency !== fee.currency
    ) {
      context.addIssue({
        code: "custom",
        path: ["maximum", "currency"],
        message: "最高费用币种必须与费用币种一致",
      });
    }
    if (
      fee.minimum &&
      fee.maximum &&
      fee.minimum.currency === fee.maximum.currency &&
      fee.minimum.amount > fee.maximum.amount
    ) {
      context.addIssue({
        code: "custom",
        path: ["maximum", "amount"],
        message: "最高费用不能低于最低费用",
      });
    }
  });

const brokerFeeSchema = z.object({
  market: z.enum(["A股", "港股", "美股", "基金", "债券"]),
  plan: z.string().optional(),
  commission: brokerFeeComponentSchema.optional(),
  platformFee: brokerFeeComponentSchema.optional(),
  note: z.string().optional(),
});

const sourceSchema = z.object({
  title: z.string(),
  url: z.url(),
});

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: () =>
        z.object({
          // Discriminates entity detail pages from plain guide pages.
          // Guides leave this undefined and get no spec table.
          kind: z.enum(["card", "broker"]).optional(),

          // --- 金融信息溯源 ---
          verifiedAt: z.coerce.date().optional(),
          officialUrl: z.url().optional(),
          sources: sourceSchema.array().default([]),
          status: z
            .enum(["active", "restricted", "discontinued", "demo"])
            .optional(),

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
          fees: brokerFeeSchema.array().default([]),
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
