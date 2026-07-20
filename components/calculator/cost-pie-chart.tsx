"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface CategoryData {
  categoryId: number;
  categoryName: string;
  subtotal: number;
  percentage: number;
}

interface CostPieChartProps {
  data: CategoryData[];
}

const COLORS = ["#60B5FF", "#FF9149", "#80D8C3", "#A19AD3"];

// Custom Tooltip Component with dark theme
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-slate-300 text-xs font-medium">{data.name}</p>
        <p className="text-slate-100 text-sm font-bold">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0
          }).format(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

function CostPieChart({ data }: CostPieChartProps) {
  const chartData = (data ?? []).filter((d) => (d?.subtotal ?? 0) > 0).map((d, i) => ({
    name: d?.categoryName ?? "Unknown",
    value: d?.subtotal ?? 0
  }));

  if (chartData?.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        No data to display
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {(chartData ?? []).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length] ?? "#60B5FF"} />
            ))}
          </Pie>
          <Tooltip 
            content={<CustomTooltip />}
            wrapperStyle={{ backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '8px', outline: 'none' }}
            contentStyle={{ backgroundColor: '#0f172a', border: 'none', color: '#e2e8f0' }}
          />
          <Legend
            verticalAlign="top"
            wrapperStyle={{ fontSize: 11 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CostPieChart;
