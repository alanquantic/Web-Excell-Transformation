"use client";

import { useState, useEffect } from "react";
import { X, Save, FolderOpen, Trash2 } from "lucide-react";

interface Scenario {
  id: string;
  name: string;
  grandTotal: number;
  updatedAt: string;
}

interface ScenarioModalProps {
  isOpen: boolean;
  mode: "save" | "load";
  scenarios: Scenario[];
  onClose: () => void;
  onSave: (name: string) => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ScenarioModal({
  isOpen,
  mode,
  scenarios,
  onClose,
  onSave,
  onLoad,
  onDelete
}: ScenarioModalProps) {
  const [name, setName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setDeleteConfirm(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {mode === "save" ? <Save className="w-5 h-5 text-blue-600" /> : <FolderOpen className="w-5 h-5 text-blue-600" />}
            {mode === "save" ? "Save Scenario" : "Load Scenario"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {mode === "save" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scenario Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter a name for this scenario"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <button
                onClick={() => {
                  if (name?.trim()) {
                    onSave(name?.trim());
                  }
                }}
                disabled={!name?.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Scenario
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {(scenarios ?? []).length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No saved scenarios yet
                </div>
              ) : (
                (scenarios ?? []).map((scenario) => (
                  <div
                    key={scenario?.id}
                    className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition group"
                  >
                    <button
                      onClick={() => onLoad(scenario?.id)}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium text-gray-900">{scenario?.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span>{formatCurrency(scenario?.grandTotal ?? 0)}</span>
                        <span>•</span>
                        <span>{formatDate(scenario?.updatedAt)}</span>
                      </div>
                    </button>
                    {deleteConfirm === scenario?.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onDelete(scenario?.id);
                            setDeleteConfirm(null);
                          }}
                          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(scenario?.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
