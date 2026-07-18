import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { formatChartAxis, formatMoney } from "../_lib/format";

export function LineChart({ cogs, labels, revenue }: { readonly cogs: readonly number[]; readonly labels: readonly string[]; readonly revenue: readonly number[] }) {
  const chartData = labels.map((label, index) => ({
    CMV: cogs[index] ?? 0,
    Receita: revenue[index] ?? 0,
    day: label
  }));
  return (
    <div className="chart-shell">
      <ResponsiveContainer height="100%" width="100%">
        <RechartsLineChart data={chartData} margin={{ bottom: 10, left: 6, right: 14, top: 12 }}>
          <CartesianGrid stroke="#e8edf3" strokeDasharray="3 3" vertical={false} />
          <XAxis axisLine={{ stroke: "#cbd5e1" }} dataKey="day" minTickGap={8} tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} />
          <YAxis axisLine={false} tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(value) => formatChartAxis(Number(value))} tickLine={false} width={38} />
          <Tooltip formatter={(value) => formatMoney(Number(value) * 100)} />
          <Legend iconSize={7} wrapperStyle={{ color: "#334155", fontSize: 11, fontWeight: 650, paddingTop: 8 }} />
          <Line activeDot={{ r: 4 }} connectNulls dataKey="Receita" dot={{ r: 2.5 }} isAnimationActive={false} stroke="#0077d9" strokeWidth={2.1} type="linear" />
          <Line activeDot={{ r: 4 }} connectNulls dataKey="CMV" dot={{ r: 2.5 }} isAnimationActive={false} stroke="#ef4444" strokeWidth={2.1} type="linear" />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MarginChart({ labels, values }: { readonly labels: readonly string[]; readonly values: readonly number[] }) {
  const chartData = labels.map((label, index) => ({
    Margem: values[index] ?? 0,
    day: label
  }));
  return (
    <div className="chart-shell">
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart data={chartData} margin={{ bottom: 10, left: 6, right: 14, top: 12 }}>
          <defs>
            <linearGradient id="marginGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e8edf3" strokeDasharray="3 3" vertical={false} />
          <XAxis axisLine={{ stroke: "#cbd5e1" }} dataKey="day" minTickGap={8} tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} />
          <YAxis axisLine={false} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(value) => `${value}%`} tickLine={false} width={38} />
          <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
          <Area activeDot={{ r: 4 }} connectNulls dataKey="Margem" dot={{ r: 2.5 }} fill="url(#marginGradient)" isAnimationActive={false} stroke="#059669" strokeWidth={2.1} type="linear" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
