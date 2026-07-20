export type Currency = "CNY" | "HKD" | "USD";

export interface Money {
  amount: number;
  currency: Currency;
}

interface FeeComponentBase {
  amount: number;
  minimum?: Money;
  maximum?: Money;
  note?: string;
}

export type BrokerFeeComponent =
  | (FeeComponentBase & {
      unit: "per_order" | "per_share" | "per_contract";
      currency: Currency;
    })
  | (FeeComponentBase & {
      unit: "trade_value_percent" | "trade_value_basis_points";
      currency?: never;
    });

export interface BrokerFee {
  market: string;
  plan?: string;
  commission?: BrokerFeeComponent;
  platformFee?: BrokerFeeComponent;
  note?: string;
}

export type BrokerStatus = "active" | "restricted" | "discontinued" | "demo";

const currencySymbols: Record<Currency, string> = {
  CNY: "¥",
  HKD: "HK$",
  USD: "US$",
};

const unitLabels = {
  per_order: "/ 单",
  per_share: "/ 股",
  per_contract: "/ 张",
} as const;

export const brokerStatusLabels: Record<BrokerStatus, string> = {
  active: "正常开放",
  restricted: "开户受限",
  discontinued: "已停止服务",
  demo: "虚构演示",
};

export function formatMoney(value: Money): string {
  return `${currencySymbols[value.currency]}${value.amount}`;
}

export function formatBrokerFeeComponent(
  value: BrokerFeeComponent | undefined,
): string {
  if (!value) return "未收录";

  let result: string;
  switch (value.unit) {
    case "trade_value_percent":
      result = `${value.amount}% 成交额`;
      break;
    case "trade_value_basis_points":
      result = `万分之 ${value.amount}`;
      break;
    default:
      result = `${currencySymbols[value.currency]}${value.amount} ${unitLabels[value.unit]}`;
  }

  if (value.minimum) result += `，最低 ${formatMoney(value.minimum)} / 单`;
  if (value.maximum) result += `，最高 ${formatMoney(value.maximum)} / 单`;
  if (value.note) result += `（${value.note}）`;
  return result;
}

export function formatBrokerFeeTitle(value: BrokerFee): string {
  return `${value.market}${value.plan ? ` · ${value.plan}` : ""}`;
}
