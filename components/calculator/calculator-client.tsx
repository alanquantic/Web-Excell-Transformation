"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/ui/header";
import { PartsTable } from "@/components/calculator/parts-table";
import { ResultsPanel } from "@/components/calculator/results-panel";
import { ScenarioModal } from "@/components/calculator/scenario-modal";
import { ProductionCalculator } from "@/components/calculator/production-calculator";
import { SimulationBuilder } from "@/components/simulations/simulation-builder";
import { Plus, FolderOpen, RotateCcw, Loader2, Wrench, Factory, Cpu } from "lucide-react";

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

interface Scenario {
  id: string;
  name: string;
  grandTotal: number;
  updatedAt: string;
}

export function CalculatorClient() {
  const { data: session } = useSession() || {};
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Record<number, LineItem>>({});
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"save" | "load">("save");
  const [currentScenario, setCurrentScenario] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"parts" | "production" | "simulation">("parts");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [partsRes, scenariosRes] = await Promise.all([
        fetch("/api/parts"),
        fetch("/api/scenarios")
      ]);

      if (partsRes.ok) {
        const partsData = await partsRes.json();
        setCategories(partsData ?? []);
        initializeItems(partsData ?? []);
      }

      if (scenariosRes.ok) {
        const scenariosData = await scenariosRes.json();
        setScenarios(scenariosData ?? []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeItems = (cats: Category[]) => {
    const newItems: Record<number, LineItem> = {};
    (cats ?? []).forEach((cat) => {
      (cat?.parts ?? []).forEach((part) => {
        newItems[part?.id] = {
          partId: part?.id,
          quantity: part?.defaultQty ?? 0,
          unitPrice: part?.defaultPrice ?? 0,
          lineTotal: (part?.defaultQty ?? 0) * (part?.defaultPrice ?? 0)
        };
      });
    });
    setItems(newItems);
  };

  const handleItemChange = useCallback((partId: number, field: "quantity" | "unitPrice", value: number) => {
    setItems((prev) => {
      const current = prev?.[partId] || { partId, quantity: 0, unitPrice: 0, lineTotal: 0 };
      const updated = { ...current, [field]: value };
      updated.lineTotal = (updated?.quantity ?? 0) * (updated?.unitPrice ?? 0);
      return { ...prev, [partId]: updated };
    });
  }, []);

  const categorySubtotals = useMemo(() => {
    const subtotals = (categories ?? []).map((cat) => {
      const subtotal = (cat?.parts ?? []).reduce((sum, part) => {
        return sum + (items?.[part?.id]?.lineTotal ?? 0);
      }, 0);
      return {
        categoryId: cat?.id ?? 0,
        categoryName: cat?.name ?? "Unknown",
        subtotal,
        percentage: 0
      };
    });

    const grandTotal = subtotals?.reduce((sum, s) => sum + (s?.subtotal ?? 0), 0) || 0;
    return subtotals?.map((s) => ({
      ...s,
      percentage: grandTotal > 0 ? ((s?.subtotal ?? 0) / grandTotal) * 100 : 0
    })) ?? [];
  }, [categories, items]);

  const grandTotal = useMemo(() => {
    return categorySubtotals?.reduce((sum, s) => sum + (s?.subtotal ?? 0), 0) || 0;
  }, [categorySubtotals]);

  const handleReset = () => {
    initializeItems(categories);
    setCurrentScenario(null);
  };

  const handleNewScenario = () => {
    handleReset();
  };

  const openSaveModal = () => {
    setModalMode("save");
    setModalOpen(true);
  };

  const openLoadModal = async () => {
    const res = await fetch("/api/scenarios");
    if (res.ok) {
      setScenarios(await res.json());
    }
    setModalMode("load");
    setModalOpen(true);
  };

  const handleSaveScenario = async (name: string) => {
    try {
      setSaving(true);
      const itemsArray = Object.values(items ?? {}).map((item) => ({
        partId: item?.partId,
        quantity: item?.quantity ?? 0,
        unitPrice: item?.unitPrice ?? 0,
        lineTotal: item?.lineTotal ?? 0
      }));

      const res = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, items: itemsArray, grandTotal })
      });

      if (res.ok) {
        const scenario = await res.json();
        setCurrentScenario(scenario?.id);
        setScenarios((prev) => [scenario, ...(prev ?? [])]);
        setModalOpen(false);

        // Log to history
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioName: name,
            grandTotal,
            details: { categorySubtotals, items: itemsArray }
          })
        });
      }
    } catch (error) {
      console.error("Error saving scenario:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLoadScenario = async (id: string) => {
    try {
      const res = await fetch(`/api/scenarios/${id}`);
      if (res.ok) {
        const scenario = await res.json();
        const newItems: Record<number, LineItem> = {};
        (scenario?.items ?? []).forEach((item: any) => {
          newItems[item?.partId] = {
            partId: item?.partId,
            quantity: item?.quantity ?? 0,
            unitPrice: item?.unitPrice ?? 0,
            lineTotal: item?.lineTotal ?? 0
          };
        });
        setItems(newItems);
        setCurrentScenario(id);
        setModalOpen(false);
      }
    } catch (error) {
      console.error("Error loading scenario:", error);
    }
  };

  const handleDeleteScenario = async (id: string) => {
    try {
      const res = await fetch(`/api/scenarios/${id}`, { method: "DELETE" });
      if (res.ok) {
        setScenarios((prev) => (prev ?? []).filter((s) => s?.id !== id));
        if (currentScenario === id) {
          setCurrentScenario(null);
        }
      }
    } catch (error) {
      console.error("Error deleting scenario:", error);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const printContent = generatePrintContent();
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setExporting(false);
    }
  };

  const generatePrintContent = () => {
    const formatCurrency = (val: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val ?? 0);
    
    let partsHtml = "";
    (categories ?? []).forEach((cat) => {
      partsHtml += `<h3 style="margin-top:20px;color:#1e40af;">${cat?.name}</h3>`;
      partsHtml += `<table style="width:100%;border-collapse:collapse;margin-bottom:10px;"><thead><tr style="background:#f3f4f6;"><th style="padding:8px;text-align:left;border:1px solid #e5e7eb;">Part</th><th style="padding:8px;text-align:center;border:1px solid #e5e7eb;">Qty</th><th style="padding:8px;text-align:right;border:1px solid #e5e7eb;">Unit Price</th><th style="padding:8px;text-align:right;border:1px solid #e5e7eb;">Line Total</th></tr></thead><tbody>`;
      (cat?.parts ?? []).forEach((part) => {
        const item = items?.[part?.id] || { quantity: 0, unitPrice: 0, lineTotal: 0 };
        partsHtml += `<tr><td style="padding:8px;border:1px solid #e5e7eb;">${part?.name}</td><td style="padding:8px;text-align:center;border:1px solid #e5e7eb;">${item?.quantity}</td><td style="padding:8px;text-align:right;border:1px solid #e5e7eb;">${formatCurrency(item?.unitPrice)}</td><td style="padding:8px;text-align:right;border:1px solid #e5e7eb;">${formatCurrency(item?.lineTotal)}</td></tr>`;
      });
      const subtotal = (cat?.parts ?? []).reduce((sum, p) => sum + (items?.[p?.id]?.lineTotal ?? 0), 0);
      partsHtml += `<tr style="background:#f3f4f6;font-weight:bold;"><td colspan="3" style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Subtotal:</td><td style="padding:8px;text-align:right;border:1px solid #e5e7eb;">${formatCurrency(subtotal)}</td></tr></tbody></table>`;
    });

    return `<!DOCTYPE html><html><head><title>Eagle Spare Parts - Quote</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px;}@media print{body{padding:0;}}</style></head><body><div style="text-align:center;margin-bottom:30px;"><h1 style="color:#1e40af;margin-bottom:5px;">Eagle Spare Parts Calculator</h1><p style="color:#6b7280;">Quote Generated: ${new Date().toLocaleDateString()}</p></div>${partsHtml}<div style="margin-top:30px;padding:20px;background:#1e40af;color:white;border-radius:8px;text-align:center;"><h2 style="margin:0;">Grand Total: ${formatCurrency(grandTotal)}</h2></div><div style="margin-top:20px;padding:15px;background:#f3f4f6;border-radius:8px;"><h4 style="margin-top:0;">Summary by Category:</h4>${(categorySubtotals ?? []).map(c => `<p>${c?.categoryName}: ${formatCurrency(c?.subtotal)} (${(c?.percentage ?? 0).toFixed(1)}%)</p>`).join("")}</div></body></html>`;
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
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Eagle Calculator</h1>
          <p className="text-gray-500">Spare parts costing and production line analysis</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("parts")}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "parts"
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            <Wrench className="w-4 h-4" />
            Spare Parts
          </button>
          <button
            onClick={() => setActiveTab("production")}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "production"
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            <Factory className="w-4 h-4" />
            Quick Calculator
          </button>
          <button
            onClick={() => setActiveTab("simulation")}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "simulation"
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            <Cpu className="w-4 h-4" />
            Simulation Builder
          </button>
        </div>

        {activeTab === "parts" && (
          <>
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handleNewScenario}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-700"
              >
                <Plus className="w-4 h-4" />
                New
              </button>
              <button
                onClick={openLoadModal}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-700"
              >
                <FolderOpen className="w-4 h-4" />
                Load Scenario
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-700"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PartsTable
                  categories={categories}
                  items={items}
                  onItemChange={handleItemChange}
                />
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <ResultsPanel
                    categorySubtotals={categorySubtotals}
                    grandTotal={grandTotal}
                    onSave={openSaveModal}
                    onExportPDF={handleExportPDF}
                    saving={saving}
                    exporting={exporting}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "production" && (
          <div className="max-w-2xl">
            <ProductionCalculator />
          </div>
        )}

        {activeTab === "simulation" && (
          <div className="max-w-6xl">
            <SimulationBuilder />
          </div>
        )}
      </main>

      <ScenarioModal
        isOpen={modalOpen}
        mode={modalMode}
        scenarios={scenarios}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveScenario}
        onLoad={handleLoadScenario}
        onDelete={handleDeleteScenario}
      />
    </div>
  );
}
