import { useMemo, useState } from "react";
import {
  type BrokerFee,
  type BrokerStatus,
  brokerStatusLabels,
  formatBrokerFeeComponent,
  formatBrokerFeeTitle,
} from "../lib/broker-fees";

// Plain-serializable shape: the .astro page maps collection entries to this
// before passing them in, so the hydration payload stays lean.
export interface BrokerEntry {
  id: string;
  href: string;
  title: string;
  accountTypes: string[];
  fees: BrokerFee[];
  features: string[];
  appExperience: string;
  supportChannels: string[];
  minDeposit: number | null;
  pensionSupported: boolean | null;
  targetGroup: string;
  status: BrokerStatus | null;
}

interface Props {
  brokers: BrokerEntry[];
}

const ANY = "全部";

const cellStyle: React.CSSProperties = {
  borderBottom: "1px solid var(--sl-color-gray-5)",
  padding: "0.5rem 0.75rem",
  textAlign: "start",
  verticalAlign: "top",
};

const headStyle: React.CSSProperties = {
  ...cellStyle,
  color: "var(--sl-color-gray-2)",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const controlStyle: React.CSSProperties = {
  background: "var(--sl-color-black)",
  color: "inherit",
  border: "1px solid var(--sl-color-gray-5)",
  borderRadius: "0.25rem",
  padding: "0.4rem 0.6rem",
};

export default function BrokerTable({ brokers }: Props) {
  const [search, setSearch] = useState("");
  const [accountType, setAccountType] = useState(ANY);
  const [appExperience, setAppExperience] = useState(ANY);
  const [targetGroup, setTargetGroup] = useState(ANY);
  const [feature, setFeature] = useState(ANY);
  const [pensionOnly, setPensionOnly] = useState(false);

  // Options derive from the data, so new content adds filter options for free.
  const options = useMemo(
    () => ({
      accountTypes: unique(brokers.flatMap((b) => b.accountTypes)),
      appExperiences: unique(brokers.map((b) => b.appExperience)),
      targetGroups: unique(brokers.map((b) => b.targetGroup)),
      features: unique(brokers.flatMap((b) => b.features)),
    }),
    [brokers],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return brokers.filter((b) => {
      if (q) {
        const haystack = [b.title, ...b.features].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (accountType !== ANY && !b.accountTypes.includes(accountType))
        return false;
      if (
        accountType !== ANY &&
        b.fees.length > 0 &&
        !b.fees.some((fee) => fee.market === accountType)
      )
        return false;
      if (appExperience !== ANY && b.appExperience !== appExperience)
        return false;
      if (targetGroup !== ANY && b.targetGroup !== targetGroup) return false;
      if (feature !== ANY && !b.features.includes(feature)) return false;
      if (pensionOnly && !b.pensionSupported) return false;
      return true;
    });
  }, [
    brokers,
    search,
    accountType,
    appExperience,
    targetGroup,
    feature,
    pensionOnly,
  ]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索券商或特色"
          aria-label="搜索"
          style={{ ...controlStyle, flex: "1 1 14rem" }}
        />
        <Select
          label="账户"
          value={accountType}
          onChange={setAccountType}
          options={options.accountTypes}
        />
        <Select
          label="App"
          value={appExperience}
          onChange={setAppExperience}
          options={options.appExperiences}
        />
        <Select
          label="人群"
          value={targetGroup}
          onChange={setTargetGroup}
          options={options.targetGroups}
        />
        <Select
          label="特色"
          value={feature}
          onChange={setFeature}
          options={options.features}
        />
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <input
            type="checkbox"
            checked={pensionOnly}
            onChange={(e) => setPensionOnly(e.target.checked)}
          />
          仅看支持养老金
        </label>
      </div>

      <p style={{ color: "var(--sl-color-gray-2)" }}>
        共 {filtered.length} 家券商
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headStyle}>券商</th>
              <th style={headStyle}>可开账户</th>
              <th style={headStyle}>费用（按市场）</th>
              <th style={headStyle}>App</th>
              <th style={headStyle}>养老金</th>
              <th style={headStyle}>特色</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id}>
                <td style={cellStyle}>
                  <a href={b.href}>{b.title}</a>
                  {b.status && (
                    <span style={demoStyle}>
                      {brokerStatusLabels[b.status]}
                    </span>
                  )}
                </td>
                <td style={cellStyle}>{b.accountTypes.join(" / ")}</td>
                <td style={cellStyle}>
                  {b.fees.length === 0
                    ? "未收录"
                    : b.fees.map((fee, index) => (
                        <div
                          key={`${fee.market}-${fee.plan ?? index}`}
                          style={
                            index === 0 ? undefined : { marginTop: "0.5rem" }
                          }
                        >
                          <strong>{formatBrokerFeeTitle(fee)}</strong>
                          <br />
                          佣金：{formatBrokerFeeComponent(fee.commission)}
                          {fee.platformFee && (
                            <>
                              <br />
                              平台费：
                              {formatBrokerFeeComponent(fee.platformFee)}
                            </>
                          )}
                          {fee.note && (
                            <>
                              <br />
                              说明：{fee.note}
                            </>
                          )}
                        </div>
                      ))}
                </td>
                <td style={cellStyle}>{b.appExperience}</td>
                <td style={cellStyle}>
                  {b.pensionSupported === null
                    ? "未收录"
                    : b.pensionSupported
                      ? "是"
                      : "否"}
                </td>
                <td style={cellStyle}>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.35rem",
                    }}
                  >
                    {b.features.map((f) => (
                      <span key={f} style={chipStyle}>
                        {f}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{ ...cellStyle, color: "var(--sl-color-gray-2)" }}
                >
                  没有符合条件的券商。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const chipStyle: React.CSSProperties = {
  background: "var(--sl-color-gray-7)",
  borderRadius: "999px",
  padding: "0.1rem 0.6rem",
  fontSize: "var(--sl-text-xs)",
  whiteSpace: "nowrap",
};

const demoStyle: React.CSSProperties = {
  ...chipStyle,
  marginInlineStart: "0.4rem",
};

function unique(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      aria-label={label}
      onChange={(e) => onChange(e.target.value)}
      style={controlStyle}
    >
      <option value={ANY}>{label}：全部</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
