"use client";

import { DollarSign, TrendingUp, Download, Save } from "lucide-react";
import dynamic from "next/dynamic";

const CostPieChart = dynamic(() => import("./cost-pie-chart"), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
});

interface CategorySubtotal {
  categoryId: number;
  categoryName: string;
  subtotal: number;
  percentage: number;
}

interface ResultsPanelProps {
  categorySubtotals: CategorySubtotal[];
  grandTotal: number;
  onSave: () => void;
  onExportPDF: () => void;
  saving: boolean;
  exporting: boolean;
}

export function ResultsPanel({
  categorySubtotals,
  grandTotal,
  onSave,
  onExportPDF,
  saving,
  exporting
}: ResultsPanelProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Grand Total Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-blue-100 font-medium">Grand Total</span>
        </div>
        <div className="text-4xl font-bold animate-count-up">
          {formatCurrency(grandTotal ?? 0)}
        </div>
      </div>

      {/* Category Subtotals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          Category Breakdown
        </h3>
        <div className="space-y-3">
          {(categorySubtotals ?? []).map((cat) => (
            <div key={cat?.categoryId} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{cat?.categoryName}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(cat?.subtotal ?? 0)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(cat?.percentage ?? 0, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {(cat?.percentage ?? 0).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-gray-900 font-semibold mb-4">Cost Distribution</h3>
        <CostPieChart data={categorySubtotals ?? []} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Scenario
        </button>
        <button
          onClick={onExportPDF}
          disabled={exporting}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition disabled:opacity-50"
        >
          {exporting ? (
            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export PDF
        </button>
      </div>
    </div>
  );
}
