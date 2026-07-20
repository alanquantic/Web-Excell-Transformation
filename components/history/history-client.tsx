"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/ui/header";
import { History, Calendar, DollarSign, FileText, Loader2 } from "lucide-react";

interface HistoryEntry {
  id: string;
  scenarioName: string | null;
  grandTotal: number;
  calculatedAt: string;
  details: any;
}

export function HistoryClient() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/history?limit=100");
      if (res.ok) {
        const data = await res.json();
        setHistory(data ?? []);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Unknown date";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(value ?? 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <History className="w-6 h-6 text-blue-600" />
            Calculation History
          </h1>
          <p className="text-gray-500">View your past calculations and saved scenarios</p>
        </div>

        {(history ?? []).length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No History Yet</h3>
            <p className="text-gray-500">Your calculation history will appear here once you save scenarios.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              {(history ?? []).map((entry) => (
                <button
                  key={entry?.id}
                  onClick={() => setSelectedEntry(entry)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    selectedEntry?.id === entry?.id
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-gray-100 hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        {entry?.scenarioName || "Unnamed Calculation"}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry?.calculatedAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        {formatCurrency(entry?.grandTotal ?? 0)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedEntry && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {selectedEntry?.scenarioName || "Unnamed Calculation"}
                </h3>
                <div className="text-sm text-gray-500 mb-4">
                  {formatDate(selectedEntry?.calculatedAt)}
                </div>

                {selectedEntry?.details?.categorySubtotals && (
                  <div className="space-y-3 mb-6">
                    <h4 className="text-sm font-medium text-gray-700">Category Breakdown</h4>
                    {(selectedEntry?.details?.categorySubtotals ?? []).map((cat: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{cat?.categoryName}</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(cat?.subtotal ?? 0)}
                          <span className="text-gray-400 ml-2">({(cat?.percentage ?? 0).toFixed(1)}%)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Grand Total</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(selectedEntry?.grandTotal ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
