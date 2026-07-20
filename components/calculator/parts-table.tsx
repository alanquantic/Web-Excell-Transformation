"use client";

import { Wrench, Zap, Cog, CircleDot } from "lucide-react";

interface Part {
  id: number;
  name: string;
  partType: string;
  defaultQty: number;
  defaultPrice: number;
}

interface Category {
  id: number;
  name: string;
  parts: Part[];
}

interface LineItem {
  partId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface PartsTableProps {
  categories: Category[];
  items: Record<number, LineItem>;
  onItemChange: (partId: number, field: "quantity" | "unitPrice", value: number) => void;
}

const partTypeIcons: Record<string, any> = {
  hydraulic: Wrench,
  electronic: Zap,
  mechanical: Cog,
  blade: CircleDot
};

const partTypeColors: Record<string, string> = {
  hydraulic: "text-blue-600 bg-blue-100",
  electronic: "text-amber-600 bg-amber-100",
  mechanical: "text-gray-600 bg-gray-100",
  blade: "text-red-600 bg-red-100"
};

export function PartsTable({ categories, items, onItemChange }: PartsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {(categories ?? []).map((category) => {
        const Icon = partTypeIcons[category?.parts?.[0]?.partType ?? "mechanical"] || Cog;
        
        return (
          <div key={category?.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {category?.name}
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3 font-medium">Part Name</th>
                    <th className="px-4 py-3 font-medium text-center w-24">Qty</th>
                    <th className="px-4 py-3 font-medium text-center w-32">Unit Price</th>
                    <th className="px-4 py-3 font-medium text-right w-32">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(category?.parts ?? []).map((part) => {
                    const item = items?.[part?.id] || { quantity: 0, unitPrice: 0, lineTotal: 0 };
                    const TypeIcon = partTypeIcons[part?.partType ?? "mechanical"] || Cog;
                    const colorClass = partTypeColors[part?.partType ?? "mechanical"] || "text-gray-600 bg-gray-100";
                    
                    return (
                      <tr key={part?.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-md flex items-center justify-center ${colorClass}`}>
                              <TypeIcon className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-gray-900 text-sm font-medium">{part?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            max="9999"
                            value={item?.quantity ?? 0}
                            onChange={(e) => onItemChange(part?.id, "quantity", parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 text-center border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item?.unitPrice ?? 0}
                              onChange={(e) => onItemChange(part?.id, "unitPrice", parseFloat(e.target.value) || 0)}
                              className="w-full pl-7 pr-3 py-2 text-right border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-gray-900 font-medium text-sm">
                            {formatCurrency(item?.lineTotal ?? 0)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
