// src/components/admin/AdminOverviewCharts.tsx
"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface MonthlyData {
  label: string;
  published: number;
  views: number;
}

interface CategoryData {
  name: string;
  count: number;
}

interface Props {
  monthly: MonthlyData[];
  byCategory: CategoryData[];
}

export function AdminOverviewCharts({ monthly, byCategory }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
          Artikel Terpublikasi
        </h3>
        <p className="mb-4 text-xs text-neutral-500">12 bulan terakhir</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-neutral-200 dark:stroke-neutral-800"
              />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
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
                dataKey="published"
                stroke="#0369a1"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Artikel"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
          Artikel per Kategori
        </h3>
        <p className="mb-4 text-xs text-neutral-500">Total artikel terpublikasi</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCategory} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-neutral-200 dark:stroke-neutral-800"
              />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={100}
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
              <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} name="Artikel" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}