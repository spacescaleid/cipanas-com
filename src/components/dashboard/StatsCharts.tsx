// src/components/dashboard/StatsCharts.tsx
"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

interface MonthlyData {
  label: string;
  published: number;
  views: number;
}

interface CategoryData {
  name: string;
  views: number;
}

const COLORS = [
  "#0369a1", // brand
  "#f97316", // accent
  "#10b981",
  "#8b5cf6",
  "#f43f5e",
  "#eab308",
  "#06b6d4",
];

interface Props {
  monthly: MonthlyData[];
  byCategory: CategoryData[];
}

export function StatsCharts({ monthly, byCategory }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Views per month */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-1 font-serif text-lg font-bold text-neutral-900 dark:text-white">
          Views per Bulan
        </h3>
        <p className="mb-4 text-xs text-neutral-500">
          12 bulan terakhir
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                className="fill-neutral-600 dark:fill-neutral-400"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="fill-neutral-600 dark:fill-neutral-400"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(23 23 23)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#0369a1"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Views"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Articles published per month */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-1 font-serif text-lg font-bold text-neutral-900 dark:text-white">
          Artikel Terpublikasi
        </h3>
        <p className="mb-4 text-xs text-neutral-500">
          Jumlah artikel yang tayang per bulan
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                className="fill-neutral-600 dark:fill-neutral-400"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                allowDecimals={false}
                className="fill-neutral-600 dark:fill-neutral-400"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(23 23 23)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="published" fill="#f97316" radius={[4, 4, 0, 0]} name="Artikel" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Views by category — pie chart */}
      {byCategory.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
          <h3 className="mb-1 font-serif text-lg font-bold text-neutral-900 dark:text-white">
            Distribusi Views per Kategori
          </h3>
          <p className="mb-4 text-xs text-neutral-500">
            Total views dari seluruh artikel terpublikasi Anda
          </p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="views"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry: { name?: string; value?: number }) => `${entry.name ?? ""} (${entry.value ?? 0})`}
                  labelLine={false}
                >
                  {byCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgb(23 23 23)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}