import { useMemo, useState } from "react";

// Plain-serializable shape: the .astro page maps collection entries to this
// before passing them in, so the hydration payload stays lean.
export interface CardEntry {
  id: string;
  href: string;
  title: string;
  bank: string;
  network: string;
  cardType: string;
  annualFee: number;
  annualFeeWaiver: string;
  cashbackRate: number | null;
  pointsPerYuan: number | null;
  perks: string[];
  targetGroup: string;
  difficulty: string;
}

interface Props {
  cards: CardEntry[];
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

export default function CardTable({ cards }: Props) {
  const [search, setSearch] = useState("");
  const [network, setNetwork] = useState(ANY);
  const [cardType, setCardType] = useState(ANY);
  const [targetGroup, setTargetGroup] = useState(ANY);
  const [difficulty, setDifficulty] = useState(ANY);
  const [perk, setPerk] = useState(ANY);
  const [maxFee, setMaxFee] = useState("");

  // Options derive from the data, so new content adds filter options for free.
  const options = useMemo(
    () => ({
      networks: unique(cards.map((c) => c.network)),
      cardTypes: unique(cards.map((c) => c.cardType)),
      targetGroups: unique(cards.map((c) => c.targetGroup)),
      difficulties: unique(cards.map((c) => c.difficulty)),
      perks: unique(cards.flatMap((c) => c.perks)),
    }),
    [cards],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const feeLimit = maxFee === "" ? null : Number(maxFee);

    return cards.filter((c) => {
      if (q) {
        const haystack = [c.title, c.bank, ...c.perks].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (network !== ANY && c.network !== network) return false;
      if (cardType !== ANY && c.cardType !== cardType) return false;
      if (targetGroup !== ANY && c.targetGroup !== targetGroup) return false;
      if (difficulty !== ANY && c.difficulty !== difficulty) return false;
      if (perk !== ANY && !c.perks.includes(perk)) return false;
      if (
        feeLimit !== null &&
        !Number.isNaN(feeLimit) &&
        c.annualFee > feeLimit
      )
        return false;
      return true;
    });
  }, [cards, search, network, cardType, targetGroup, difficulty, perk, maxFee]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索卡名、银行或权益"
          aria-label="搜索"
          style={{ ...controlStyle, flex: "1 1 14rem" }}
        />
        <Select
          label="卡组织"
          value={network}
          onChange={setNetwork}
          options={options.networks}
        />
        <Select
          label="类型"
          value={cardType}
          onChange={setCardType}
          options={options.cardTypes}
        />
        <Select
          label="人群"
          value={targetGroup}
          onChange={setTargetGroup}
          options={options.targetGroups}
        />
        <Select
          label="难度"
          value={difficulty}
          onChange={setDifficulty}
          options={options.difficulties}
        />
        <Select
          label="权益"
          value={perk}
          onChange={setPerk}
          options={options.perks}
        />
        <input
          type="number"
          min="0"
          value={maxFee}
          onChange={(e) => setMaxFee(e.target.value)}
          placeholder="最高年费"
          aria-label="最高年费"
          style={{ ...controlStyle, width: "8rem" }}
        />
      </div>

      <p style={{ color: "var(--sl-color-gray-2)" }}>
        共 {filtered.length} 张卡
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headStyle}>卡片</th>
              <th style={headStyle}>银行</th>
              <th style={headStyle}>卡组织</th>
              <th style={headStyle}>年费</th>
              <th style={headStyle}>返现</th>
              <th style={headStyle}>积分</th>
              <th style={headStyle}>难度</th>
              <th style={headStyle}>权益</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td style={cellStyle}>
                  <a href={c.href}>{c.title}</a>
                </td>
                <td style={cellStyle}>{c.bank}</td>
                <td style={cellStyle}>{c.network}</td>
                <td style={cellStyle}>¥{c.annualFee}</td>
                <td style={cellStyle}>
                  {c.cashbackRate === null ? "—" : `${c.cashbackRate}%`}
                </td>
                <td style={cellStyle}>
                  {c.pointsPerYuan === null ? "—" : `${c.pointsPerYuan}×`}
                </td>
                <td style={cellStyle}>{c.difficulty}</td>
                <td style={cellStyle}>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.35rem",
                    }}
                  >
                    {c.perks.map((p) => (
                      <span key={p} style={chipStyle}>
                        {p}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  style={{ ...cellStyle, color: "var(--sl-color-gray-2)" }}
                >
                  没有符合条件的卡片。
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
