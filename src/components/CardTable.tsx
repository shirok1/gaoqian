import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Plain-serializable shape: the .astro page maps collection entries to this
// before passing them in, so the hydration payload stays lean.
export interface CardEntry {
  id: string;
  href: string;
  title: string;
  bank: string;
  network: string;
  cardType: string;
  annualFee: { amount: number; currency: string; waiver?: string } | null;
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
      if (feeLimit !== null && !Number.isNaN(feeLimit)) {
        if (c.annualFee === null || c.annualFee.amount > feeLimit) return false;
      }
      return true;
    });
  }, [cards, search, network, cardType, targetGroup, difficulty, perk, maxFee]);

  return (
    <div className="shadcn-scope">
      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索卡名、银行或权益"
          aria-label="搜索"
          className="min-w-56 flex-1"
        />
        <FilterSelect
          label="卡组织"
          value={network}
          onChange={setNetwork}
          options={options.networks}
        />
        <FilterSelect
          label="类型"
          value={cardType}
          onChange={setCardType}
          options={options.cardTypes}
        />
        <FilterSelect
          label="人群"
          value={targetGroup}
          onChange={setTargetGroup}
          options={options.targetGroups}
        />
        <FilterSelect
          label="难度"
          value={difficulty}
          onChange={setDifficulty}
          options={options.difficulties}
        />
        <FilterSelect
          label="权益"
          value={perk}
          onChange={setPerk}
          options={options.perks}
        />
        <Input
          type="number"
          min="0"
          value={maxFee}
          onChange={(e) => setMaxFee(e.target.value)}
          placeholder="最高年费"
          aria-label="最高年费"
          className="w-32"
        />
      </div>

      <p className="mb-2 text-sm text-muted-foreground">
        共 {filtered.length} 张卡
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>卡片</TableHead>
            <TableHead>银行</TableHead>
            <TableHead>卡组织</TableHead>
            <TableHead>年费</TableHead>
            <TableHead>返现</TableHead>
            <TableHead>积分</TableHead>
            <TableHead>难度</TableHead>
            <TableHead>权益</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <a href={c.href}>{c.title}</a>
              </TableCell>
              <TableCell>{c.bank}</TableCell>
              <TableCell>{c.network}</TableCell>
              <TableCell>
                {c.annualFee === null
                  ? "—"
                  : `${currencySymbols[c.annualFee.currency] ?? c.annualFee.currency + " "}${c.annualFee.amount}`}
              </TableCell>
              <TableCell>
                {c.cashbackRate === null ? "—" : `${c.cashbackRate}%`}
              </TableCell>
              <TableCell>
                {c.pointsPerYuan === null ? "—" : `${c.pointsPerYuan}×`}
              </TableCell>
              <TableCell>{c.difficulty}</TableCell>
              <TableCell className="whitespace-normal">
                <div className="flex flex-wrap gap-1">
                  {c.perks.map((p) => (
                    <Badge key={p} variant="secondary">
                      {p}
                    </Badge>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-muted-foreground"
              >
                没有符合条件的卡片。
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

const currencySymbols: Record<string, string> = {
  CNY: "¥",
  HKD: "HK$",
  USD: "$",
};

function unique(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}

function FilterSelect({
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
    <Select value={value} onValueChange={(v) => onChange(v as string)}>
      <SelectTrigger aria-label={label} className="w-auto">
        <SelectValue>
          {(v: string) => (v === ANY ? `${label}：全部` : v)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={ANY}>{label}：全部</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
