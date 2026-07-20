"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Factory,
  Plus,
  Minus,
  AlertTriangle,
  Zap,
  Fuel,
  TrendingUp,
  DollarSign,
  Scale,
  Info,
  Lightbulb,
  ArrowRight,
  Save,
  Loader2,
  CheckCircle2,
  Activity,
  Gauge,
  Power,
  Circle
} from "lucide-react";
import {
  EAGLE_MACHINE_LINE,
  TIRE_WEIGHT_CATEGORIES,
  EagleMachineSpec,
  PowerType
} from "@/lib/constants/eagle-specs";
import {
  calculateProduction,
  MachineConfiguration,
  BottleneckRecommendation,
  IdleCapacityMetrics,
  StationFlowImbalance
} from "@/lib/calculations/production";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Props for injecting project-specific rates
interface ProjectRates {
  electricityRate?: number;
  dieselRate?: number;
  laborRate?: number;
  shiftsPerDay?: number;
  hoursPerShift?: number;
  operatingDaysPerYear?: number;
  currency?: string;
}

interface SimulationBuilderProps {
  projectId?: string;
  projectRates?: ProjectRates;
  onSimulationSaved?: (simulationId: string) => void;
}

interface MachineCardProps {
  spec: EagleMachineSpec;
  quantity: number;
  powerType: PowerType;
  onQuantityChange: (qty: number) => void;
  onPowerTypeChange: (type: PowerType) => void;
  analysis?: {
    isBottleneck: boolean;
    utilizationPercent: number;
    totalThroughput: number;
    excessCapacity: number;
  };
  isConstrained: boolean;
  constraintMessage?: string;
}

// Industrial SCADA Machine Card
function MachineCard({
  spec,
  quantity,
  powerType,
  onQuantityChange,
  onPowerTypeChange,
  analysis,
  isConstrained,
  constraintMessage
}: MachineCardProps) {
  return (
    <div className={`relative industrial-card overflow-hidden transition-all duration-300 ${
      analysis?.isBottleneck
        ? "bottleneck-alert"
        : isConstrained
        ? "border-amber-500/50"
        : quantity > 0
        ? "border-slate-600/50"
        : "opacity-50 border-slate-700/30"
    }`}>
      {/* Status LED Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent">
        {quantity > 0 && (
          <div className={`h-full transition-all duration-500 ${
            analysis?.isBottleneck 
              ? "bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"
              : "bg-gradient-to-r from-transparent via-green-500 to-transparent"
          }`} style={{ width: `${analysis?.utilizationPercent || 0}%` }} />
        )}
      </div>
      
      {/* Bottleneck Alert Badge */}
      {analysis?.isBottleneck && (
        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-b flex items-center gap-1.5 shadow-glow-red z-10">
          <AlertTriangle className="w-3 h-3 animate-pulse" />
          BOTTLENECK
        </div>
      )}

      <div className="p-4 pt-5">
        {/* Header with Status LED */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Status LED */}
            <div className={`w-3 h-3 rounded-full ${
              quantity > 0
                ? analysis?.isBottleneck
                  ? "bg-red-500 shadow-glow-red animate-pulse"
                  : "bg-green-500 shadow-glow-green"
                : "bg-slate-600"
            }`} />
            <div>
              <h3 className="font-bold text-slate-100 tracking-wide">{spec.name}</h3>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                STATION {spec.linePosition}
              </p>
            </div>
          </div>
          
          {/* Industrial Quantity Controls */}
          <div className="flex items-center">
            <button
              onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
              className="w-8 h-8 bg-slate-800 border-2 border-slate-600 hover:border-eagle-yellow hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-eagle-yellow transition-all"
              style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)" }}
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="w-12 h-8 bg-slate-900 border-y-2 border-slate-600 flex items-center justify-center">
              <span className="font-mono font-bold text-lg text-eagle-yellow text-glow-yellow">{quantity}</span>
            </div>
            <button
              onClick={() => onQuantityChange(Math.min(10, quantity + 1))}
              className="w-8 h-8 bg-slate-800 border-2 border-slate-600 hover:border-eagle-yellow hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-eagle-yellow transition-all"
              style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)" }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Specs Grid - Sensor Style */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-slate-900/80 border border-slate-700 rounded p-2">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              THROUGHPUT
            </div>
            <div className="font-mono font-bold text-sm text-cyan-400 text-glow-cyan">
              {spec.production.tiresPerHourMin}-{spec.production.tiresPerHourMax}
              <span className="text-[10px] text-slate-500 ml-1">t/hr</span>
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-700 rounded p-2">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Gauge className="w-3 h-3" />
              CYCLE
            </div>
            <div className="font-mono font-bold text-sm text-cyan-400 text-glow-cyan">
              {spec.production.cycleTimeMinutesMin}-{spec.production.cycleTimeMinutesMax}
              <span className="text-[10px] text-slate-500 ml-1">min</span>
            </div>
          </div>
        </div>

        {/* Industrial Power Type Toggle */}
        <div className="flex gap-1 mb-4 bg-slate-900 p-1 rounded border border-slate-700" style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)" }}>
          <button
            onClick={() => onPowerTypeChange("ELECTRIC")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              powerType === "ELECTRIC"
                ? "bg-green-900/60 text-green-400 border border-green-600 shadow-glow-green"
                : "bg-transparent text-slate-500 border border-transparent hover:text-slate-300"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>ELEC</span>
            <span className="text-[10px] opacity-70">{spec.powerOptions.find(p => p.type === "ELECTRIC")?.horsePower}HP</span>
          </button>
          <button
            onClick={() => onPowerTypeChange("DIESEL")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              powerType === "DIESEL"
                ? "bg-orange-900/60 text-orange-400 border border-orange-600"
                : "bg-transparent text-slate-500 border border-transparent hover:text-slate-300"
            }`}
            style={powerType === "DIESEL" ? { boxShadow: "0 0 15px rgba(249, 115, 22, 0.3)" } : {}}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>DIESEL</span>
            <span className="text-[10px] opacity-70">{spec.powerOptions.find(p => p.type === "DIESEL")?.horsePower}HP</span>
          </button>
        </div>

        {/* Utilization Gauge */}
        {quantity > 0 && analysis && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Power className="w-3 h-3" />
                CAPACITY LOAD
              </span>
              <span className={`font-mono font-bold text-sm ${
                analysis.utilizationPercent === 100 
                  ? "text-red-400 text-glow-red animate-pulse" 
                  : analysis.utilizationPercent > 80
                  ? "text-yellow-400"
                  : "text-green-400 text-glow-green"
              }`}>
                {analysis.utilizationPercent.toFixed(0)}%
              </span>
            </div>
            <div className="h-3 bg-slate-900 rounded-sm border border-slate-700 overflow-hidden" style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)" }}>
              <div
                className={`h-full transition-all duration-700 ${
                  analysis.isBottleneck 
                    ? "bg-gradient-to-r from-red-600 to-red-500" 
                    : analysis.utilizationPercent > 80
                    ? "bg-gradient-to-r from-yellow-600 to-yellow-500"
                    : "bg-gradient-to-r from-green-600 to-green-500"
                }`}
                style={{ 
                  width: `${analysis.utilizationPercent}%`,
                  boxShadow: analysis.isBottleneck 
                    ? "0 0 10px rgba(239, 68, 68, 0.5)" 
                    : "0 0 10px rgba(34, 197, 94, 0.3)"
                }}
              />
            </div>
            {analysis.excessCapacity > 0 && (
              <p className="text-[10px] text-amber-400/80 font-mono flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                IDLE: {analysis.excessCapacity.toFixed(1)} t/hr
              </p>
            )}
          </div>
        )}
      </div>

      {/* Constraint Warning Panel */}
      {isConstrained && constraintMessage && (
        <div className="px-4 pb-4">
          <div className="p-2 bg-red-950/50 border border-red-800/50 rounded">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse flex-shrink-0" />
              <p className="text-[10px] text-red-400 font-mono leading-relaxed">{constraintMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Industrial Flow Connection Arrow with "+1 UNIT" indicators
function ConnectionArrow({ 
  flowImbalance, 
  isFlowActive 
}: { 
  flowImbalance?: StationFlowImbalance;
  isFlowActive?: boolean;
}) {
  const hasBlockage = flowImbalance?.isBlockage ?? false;
  const needsRebalance = flowImbalance?.needsRebalance ?? false;
  const unitsNeeded = flowImbalance?.unitsNeededToBalance ?? 0;
  
  // Show warning if upstream > downstream (material piles up)
  const showAddUnitIndicator = needsRebalance && unitsNeeded > 0;
  
  return (
    <div className="flex flex-col items-center justify-center px-1 min-w-[60px]">
      <div className="relative flex flex-col items-center gap-1">
        {/* Flow Line */}
        <div className={`relative w-12 h-2 rounded-full overflow-hidden ${
          hasBlockage 
            ? "bg-red-900/50 border border-red-700" 
            : showAddUnitIndicator
            ? "bg-amber-900/50 border border-amber-700"
            : isFlowActive
            ? "bg-green-900/50 border border-green-700"
            : "bg-slate-800 border border-slate-700"
        }`}>
          {(hasBlockage || showAddUnitIndicator || isFlowActive) && (
            <div className="absolute inset-0">
              <div className={`absolute inset-0 ${hasBlockage ? "animate-blink-alert" : showAddUnitIndicator ? "animate-pulse" : "animate-flow-pulse"}`}
                style={{
                  background: hasBlockage 
                    ? "linear-gradient(90deg, transparent, #ef4444, transparent)"
                    : showAddUnitIndicator
                    ? "linear-gradient(90deg, transparent, #f59e0b, transparent)"
                    : "linear-gradient(90deg, transparent, #22c55e, transparent)"
                }}
              />
            </div>
          )}
        </div>
        
        {/* Arrow Head */}
        <svg width="20" height="12" viewBox="0 0 20 12" className={`${
          hasBlockage 
            ? "text-red-500" 
            : showAddUnitIndicator 
            ? "text-amber-500"
            : isFlowActive 
            ? "text-green-500" 
            : "text-slate-600"
        }`}>
          <path d="M0 6 L15 6 M10 1 L18 6 L10 11" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
        
        {/* Blockage Indicator */}
        {hasBlockage && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center animate-pulse shadow-glow-red">
              <span className="text-[8px] font-bold text-white">!</span>
            </div>
          </div>
        )}
      </div>
      
      {/* "+1 UNIT" Indicator - Shows when downstream needs more capacity */}
      {showAddUnitIndicator && (
        <div className={`mt-3 px-2 py-1.5 rounded text-center shadow-lg ${
          hasBlockage 
            ? "bg-red-950/80 border border-red-700/70" 
            : "bg-amber-950/80 border border-amber-700/70"
        }`}>
          <p className={`text-[10px] font-mono font-bold leading-tight ${
            hasBlockage ? "text-red-400" : "text-amber-400"
          }`}>
            +{unitsNeeded} UNIT
          </p>
          <p className="text-[8px] text-slate-500 font-mono mt-0.5">
            {flowImbalance?.toMachineName?.split(' ')[0]}
          </p>
        </div>
      )}
    </div>
  );
}

export function SimulationBuilder({ projectId, projectRates, onSimulationSaved }: SimulationBuilderProps) {
  const [configurations, setConfigurations] = useState<Record<string, MachineConfiguration>>(() => {
    const initial: Record<string, MachineConfiguration> = {};
    EAGLE_MACHINE_LINE.forEach(spec => {
      initial[spec.code] = {
        machineCode: spec.code,
        quantity: 1,
        powerType: "ELECTRIC"
      };
    });
    return initial;
  });

  const [tireSizeCategory, setTireSizeCategory] = useState("medium");
  const [shiftsPerDay, setShiftsPerDay] = useState(projectRates?.shiftsPerDay || 1);
  const [useTypicalRates, setUseTypicalRates] = useState(true);

  // Save modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [simulationName, setSimulationName] = useState("");
  const [simulationDescription, setSimulationDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Use project rates if provided, otherwise use defaults
  const effectiveRates = useMemo(() => ({
    electricityRate: projectRates?.electricityRate ?? 0.12,
    dieselRate: projectRates?.dieselRate ?? 3.50,
    laborRate: projectRates?.laborRate ?? 25.00,
    hoursPerShift: projectRates?.hoursPerShift ?? 8,
    operatingDaysPerYear: projectRates?.operatingDaysPerYear ?? 250,
    currency: projectRates?.currency ?? "USD"
  }), [projectRates]);

  const result = useMemo(() => {
    const machines = Object.values(configurations).filter(c => c.quantity > 0);
    if (machines.length === 0) return null;
    
    return calculateProduction({
      machines,
      tireSizeCategory,
      shiftsPerDay,
      useTypicalRates,
      electricityRate: effectiveRates.electricityRate,
      dieselRate: effectiveRates.dieselRate,
      laborRate: effectiveRates.laborRate,
      hoursPerShift: effectiveRates.hoursPerShift,
      operatingDaysPerYear: effectiveRates.operatingDaysPerYear
    });
  }, [configurations, tireSizeCategory, shiftsPerDay, useTypicalRates, effectiveRates]);

  const handleQuantityChange = useCallback((code: string, qty: number) => {
    setConfigurations(prev => ({
      ...prev,
      [code]: { ...prev[code], quantity: qty }
    }));
  }, []);

  const handlePowerTypeChange = useCallback((code: string, type: PowerType) => {
    setConfigurations(prev => ({
      ...prev,
      [code]: { ...prev[code], powerType: type }
    }));
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: effectiveRates.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 1) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  // Get flow imbalance between two adjacent machines
  const getFlowImbalance = (fromCode: string, toCode: string): StationFlowImbalance | undefined => {
    if (!result?.flowImbalances) return undefined;
    return result.flowImbalances.find(
      f => f.fromMachineCode === fromCode && f.toMachineCode === toCode
    );
  };

  // Save simulation handler
  const handleSaveSimulation = async () => {
    if (!projectId || !result || !result.isValid) return;
    
    setSaving(true);
    setSaveError(null);

    try {
      const machines = Object.values(configurations)
        .filter(c => c.quantity > 0)
        .map(c => ({
          machineCode: c.machineCode,
          quantity: c.quantity,
          powerType: c.powerType,
        }));

      const payload = {
        projectId,
        name: simulationName,
        description: simulationDescription || undefined,
        machines,
        tireSizeCategory,
        shiftsPerDay,
        useTypicalRates,
        results: {
          tiresPerHour: result.maxThroughputPerHour,
          tiresPerShift: result.tiresPerShift,
          tiresPerYear: result.tiresPerYear,
          tonsPerShift: result.tonsPerShift,
          tonsPerYear: result.tonsPerYear,
          rubberTonsPerYear: result.rubberTonsPerYear,
          laborCostYear: result.laborCostPerYear,
          energyCostYear: result.energyCostPerYear,
          maintenanceCostYear: result.maintenanceCostPerYear,
          totalOpexYear: result.totalOpexPerYear,
          costPerTire: result.costPerTire,
          costPerTon: result.costPerTon,
          potentialRevenue: result.rubberRevenuePerYear,
          estimatedProfit: result.estimatedProfitPerYear,
          bottleneckMachine: result.bottleneckMachineName,
          efficiencyScore: result.efficiencyScore,
          tireWeightKg: result.tireWeightKg,
          machineAnalysis: result.machineAnalysis.map(m => ({
            machineCode: m.machineCode,
            utilizationPercent: m.utilizationPercent,
            isBottleneck: m.isBottleneck,
            totalThroughput: m.totalThroughput,
            laborCostPerHour: m.laborCostPerHour,
            energyCostPerHour: m.energyCostPerHour,
            maintenanceCostPerHour: m.maintenanceCostPerHour,
          })),
        },
      };

      const response = await fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save simulation");
      }

      const savedSimulation = await response.json();
      setSaveSuccess(true);
      
      // Reset form after short delay
      setTimeout(() => {
        setShowSaveModal(false);
        setSimulationName("");
        setSimulationDescription("");
        setSaveSuccess(false);
        onSimulationSaved?.(savedSimulation.id);
      }, 1500);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save simulation");
    } finally {
      setSaving(false);
    }
  };

  // Check if save is possible
  const canSave = projectId && result && result.isValid;
  
  // Check if flow is active (all machines have quantity > 0)
  const isFlowActive = Object.values(configurations).every(c => c.quantity > 0);

  return (
    <div className="space-y-6">
      {/* Industrial Header Panel */}
      <div className="industrial-card overflow-hidden">
        <div className="panel-header">
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-glow-green animate-pulse" />
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">SYSTEM ONLINE</span>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-eagle-yellow/20 border border-eagle-yellow/50 rounded flex items-center justify-center">
                <Factory className="w-5 h-5 text-eagle-yellow" />
              </div>
              <span className="tracking-wide">PRODUCTION LINE BUILDER</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-mono">
              Configure Eagle OTR Processing Line • Auto Bottleneck Detection
            </p>
          </div>
          
          {/* Save Button - Industrial Style */}
          {canSave && (
            <button 
              onClick={() => setShowSaveModal(true)}
              className="industrial-btn-primary flex items-center gap-2 px-5 py-2.5"
            >
              <Save className="w-4 h-4" />
              <span className="font-bold uppercase tracking-wider text-sm">Save Config</span>
            </button>
          )}
        </div>
      </div>

      {/* Save Modal - Industrial Style */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent className="industrial-card border-slate-600 bg-slate-900/95 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-eagle-yellow font-bold tracking-wide">SAVE SIMULATION</DialogTitle>
            <DialogDescription className="text-slate-400 font-mono text-sm">
              Save configuration for comparison and reporting
            </DialogDescription>
          </DialogHeader>
          
          {saveSuccess ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
              <p className="text-lg font-semibold text-green-400 text-glow-green">SIMULATION SAVED</p>
              <p className="text-sm text-slate-500 mt-1 font-mono">
                Configuration stored successfully
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="sim-name" className="text-slate-400 text-xs uppercase tracking-widest">Simulation Name *</Label>
                  <Input
                    id="sim-name"
                    placeholder="e.g., Baseline Configuration, High Capacity Setup"
                    value={simulationName}
                    onChange={(e) => setSimulationName(e.target.value)}
                    className="industrial-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sim-desc" className="text-slate-400 text-xs uppercase tracking-widest">Description (optional)</Label>
                  <Textarea
                    id="sim-desc"
                    placeholder="Add notes about this configuration..."
                    value={simulationDescription}
                    onChange={(e) => setSimulationDescription(e.target.value)}
                    rows={3}
                    className="industrial-input resize-none"
                  />
                </div>
                
                {/* Summary */}
                {result && (
                  <div className="p-3 bg-slate-800/80 rounded border border-slate-700">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Config Summary</div>
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                      <div className="text-slate-400">Output: <span className="text-cyan-400">{formatNumber(result.maxThroughputPerHour)} t/hr</span></div>
                      <div className="text-slate-400">Efficiency: <span className="text-green-400">{result.efficiencyScore}%</span></div>
                      <div className="text-slate-400">Annual: <span className="text-cyan-400">{formatNumber(result.tiresPerYear, 0)}</span></div>
                      <div className="text-slate-400">Profit: <span className="text-eagle-yellow">{formatCurrency(result.estimatedProfitPerYear)}</span></div>
                    </div>
                  </div>
                )}

                {saveError && (
                  <div className="p-3 bg-red-950/50 border border-red-800/50 rounded text-sm text-red-400 font-mono">
                    {saveError}
                  </div>
                )}
              </div>
              
              <DialogFooter className="gap-2">
                <button onClick={() => setShowSaveModal(false)} className="industrial-btn">
                  Cancel
                </button>
                <button
                  onClick={handleSaveSimulation}
                  disabled={saving || !simulationName.trim()}
                  className="industrial-btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Control Panel - Settings */}
      <div className="industrial-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-eagle-yellow shadow-glow-yellow" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Control Parameters</span>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* Tire Size Selector */}
          <div>
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 block">Tire Category</label>
            <select
              value={tireSizeCategory}
              onChange={(e) => setTireSizeCategory(e.target.value)}
              className="industrial-input w-full text-sm"
            >
              {TIRE_WEIGHT_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} - {cat.description} ({cat.weightKg}kg)
                </option>
              ))}
            </select>
          </div>
          
          {/* Shifts Selector */}
          <div>
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 block">Shifts Per Day</label>
            <select
              value={shiftsPerDay}
              onChange={(e) => setShiftsPerDay(Number(e.target.value))}
              className="industrial-input w-full text-sm"
            >
              <option value={1}>1 Shift (8 hrs)</option>
              <option value={2}>2 Shifts (16 hrs)</option>
              <option value={3}>3 Shifts (24 hrs)</option>
            </select>
          </div>
          
          {/* Production Rate Toggle - Industrial Switch Style */}
          <div>
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 block">Production Rate</label>
            <div className="flex gap-1 bg-slate-900 p-1 rounded border border-slate-700" style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)" }}>
              <button
                onClick={() => setUseTypicalRates(true)}
                className={`flex-1 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                  useTypicalRates
                    ? "bg-cyan-900/60 text-cyan-400 border border-cyan-600"
                    : "bg-transparent text-slate-500 border border-transparent hover:text-slate-300"
                }`}
                style={useTypicalRates ? { boxShadow: "0 0 15px rgba(6, 182, 212, 0.3)" } : {}}
              >
                Typical
              </button>
              <button
                onClick={() => setUseTypicalRates(false)}
                className={`flex-1 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                  !useTypicalRates
                    ? "bg-orange-900/60 text-orange-400 border border-orange-600"
                    : "bg-transparent text-slate-500 border border-transparent hover:text-slate-300"
                }`}
                style={!useTypicalRates ? { boxShadow: "0 0 15px rgba(249, 115, 22, 0.3)" } : {}}
              >
                Maximum
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Machine Line Builder - Industrial Layout */}
      <div className="industrial-card overflow-hidden">
        <div className="panel-header justify-between">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Processing Line Flow</span>
          </div>
          {result && (
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isFlowActive ? "bg-green-500 shadow-glow-green animate-pulse" : "bg-slate-600"}`} />
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                {isFlowActive ? "FLOW ACTIVE" : "CONFIGURE STATIONS"}
              </span>
            </div>
          )}
        </div>
        
        <div className="p-6 overflow-x-auto">
          <div className="flex items-stretch gap-0 min-w-max">
            {EAGLE_MACHINE_LINE.map((spec, index) => {
              const config = configurations[spec.code];
              const analysis = result?.machineAnalysis.find(m => m.machineCode === spec.code);
              const nextSpec = EAGLE_MACHINE_LINE[index + 1];
              
              // Check if this machine is constrained by bottleneck
              const isConstrained = analysis && !analysis.isBottleneck && analysis.excessCapacity > 0;
              const constraintRecommendation = result?.recommendations.find(
                r => r.constrainedMachineCode === spec.code
              );

              return (
                <div key={spec.code} className="flex items-stretch">
                  <div className="w-72 flex-shrink-0">
                    <MachineCard
                      spec={spec}
                      quantity={config?.quantity || 0}
                      powerType={config?.powerType || "ELECTRIC"}
                      onQuantityChange={(qty) => handleQuantityChange(spec.code, qty)}
                      onPowerTypeChange={(type) => handlePowerTypeChange(spec.code, type)}
                      analysis={analysis ? {
                        isBottleneck: analysis.isBottleneck,
                        utilizationPercent: analysis.utilizationPercent,
                        totalThroughput: analysis.totalThroughput,
                        excessCapacity: analysis.excessCapacity
                      } : undefined}
                      isConstrained={!!isConstrained}
                      constraintMessage={constraintRecommendation?.recommendedAction}
                    />
                  </div>
                  
                  {nextSpec && (
                    <ConnectionArrow
                      flowImbalance={getFlowImbalance(spec.code, nextSpec.code)}
                      isFlowActive={isFlowActive && config?.quantity > 0}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Dashboard - Industrial Metrics */}
      {result && result.isValid && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Throughput Card */}
          <div className="metric-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Line Output</span>
            </div>
            <div className="text-3xl font-mono font-bold text-cyan-400 text-glow-cyan">
              {formatNumber(result.maxThroughputPerHour)}
              <span className="text-sm text-slate-500 ml-1">t/hr</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-500">Per Shift:</span>
                <span className="text-slate-300">{result.tiresPerShift}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-500">Per Year:</span>
                <span className="text-slate-300">{formatNumber(result.tiresPerYear, 0)}</span>
              </div>
            </div>
          </div>

          {/* Weight Card */}
          <div className="metric-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-green-500" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Material</span>
            </div>
            <div className="text-3xl font-mono font-bold text-green-400 text-glow-green">
              {formatNumber(result.tonsPerYear, 0)}
              <span className="text-sm text-slate-500 ml-1">t/yr</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-500">Rubber:</span>
                <span className="text-slate-300">{formatNumber(result.rubberTonsPerYear, 0)} t</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-500">Per Shift:</span>
                <span className="text-slate-300">{formatNumber(result.tonsPerShift, 1)} t</span>
              </div>
            </div>
          </div>

          {/* Cost Card */}
          <div className="metric-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-purple-500" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">OPEX</span>
            </div>
            <div className="text-2xl font-mono font-bold text-purple-400">
              {formatCurrency(result.totalOpexPerYear)}
              <span className="text-xs text-slate-500">/yr</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-500">$/Tire:</span>
                <span className="text-slate-300">{formatCurrency(result.costPerTire)}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-500">$/Ton:</span>
                <span className="text-slate-300">{formatCurrency(result.costPerTon)}</span>
              </div>
            </div>
          </div>

          {/* Efficiency Card */}
          <div className={`metric-card p-4 ${
            result.efficiencyScore >= 80
              ? "border-green-700/50"
              : result.efficiencyScore >= 50
              ? "border-yellow-700/50"
              : "border-red-700/50"
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Gauge className="w-4 h-4 text-eagle-yellow" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Efficiency</span>
            </div>
            <div className={`text-3xl font-mono font-bold ${
              result.efficiencyScore >= 80
                ? "text-green-400 text-glow-green"
                : result.efficiencyScore >= 50
                ? "text-yellow-400"
                : "text-red-400 text-glow-red"
            }`}>
              {result.efficiencyScore}%
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-500">Bottleneck:</span>
                <span className="text-red-400">{result.bottleneckMachineName}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-500">Est. Profit:</span>
                <span className="text-eagle-yellow">{formatCurrency(result.estimatedProfitPerYear)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cascade Flow Summary - Theory of Constraints */}
      {result && result.isValid && result.throughputLoss > 0 && (
        <div className="industrial-card overflow-hidden border-red-800/50">
          <div className="panel-header bg-red-950/50 border-red-800/50">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-glow-red animate-pulse" />
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest">⚠ Cascade Flow Analysis • Bottleneck Detected</span>
          </div>
          <div className="p-5">
            {/* Flow Visualization */}
            <div className="flex items-center justify-between gap-4 mb-6 p-4 bg-slate-900/80 rounded-lg border border-slate-700">
              <div className="text-center">
                <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Max Possible</div>
                <div className="text-2xl font-mono font-bold text-slate-400">
                  {formatNumber(result.maxPossibleThroughput)}
                  <span className="text-xs ml-1">t/hr</span>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center gap-2">
                <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-600 to-red-500 animate-pulse"
                    style={{ width: `${(result.maxThroughputPerHour / result.maxPossibleThroughput) * 100}%` }}
                  />
                </div>
                <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                <div className="flex-1 h-1 bg-slate-700 rounded-full" />
              </div>
              <div className="text-center">
                <div className="text-[9px] text-red-500 uppercase tracking-widest mb-1">Actual Output</div>
                <div className="text-2xl font-mono font-bold text-red-400 text-glow-red">
                  {formatNumber(result.maxThroughputPerHour)}
                  <span className="text-xs ml-1">t/hr</span>
                </div>
              </div>
            </div>
            
            {/* Loss Summary */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-red-950/30 rounded-lg border border-red-800/40">
                <div className="text-[9px] text-red-400 uppercase tracking-widest mb-1">Throughput Loss</div>
                <div className="text-xl font-mono font-bold text-red-400">
                  -{formatNumber(result.throughputLoss)} t/hr
                </div>
              </div>
              <div className="p-3 bg-amber-950/30 rounded-lg border border-amber-800/40">
                <div className="text-[9px] text-amber-400 uppercase tracking-widest mb-1">Total Idle Capacity</div>
                <div className="text-xl font-mono font-bold text-amber-400">
                  {formatNumber(result.totalIdleCapacity)} t/hr
                </div>
              </div>
              <div className="p-3 bg-purple-950/30 rounded-lg border border-purple-800/40">
                <div className="text-[9px] text-purple-400 uppercase tracking-widest mb-1">Idle Cost/Hour</div>
                <div className="text-xl font-mono font-bold text-purple-400">
                  {formatCurrency(result.totalIdleCostPerHour)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Idle Capacity Detail Panel */}
      {result && result.idleMetrics && result.idleMetrics.length > 0 && (
        <div className="industrial-card overflow-hidden">
          <div className="panel-header bg-amber-950/20 border-amber-800/30">
            <Activity className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">Idle Capacity by Station</span>
          </div>
          <div className="p-4 space-y-3">
            {result.idleMetrics.map((idle) => (
              <div key={idle.machineCode} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-bold text-slate-200">{idle.machineName}</span>
                  </div>
                  <span className="text-amber-400 font-mono font-bold text-sm">
                    {idle.idlePercent.toFixed(0)}% IDLE
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex-1">
                    <div className="text-[9px] text-slate-500 uppercase mb-1">Capacity</div>
                    <span className="text-slate-300">{formatNumber(idle.totalCapacity)} t/hr</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[9px] text-slate-500 uppercase mb-1">Actual Flow</div>
                    <span className="text-cyan-400">{formatNumber(idle.actualFlow)} t/hr</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[9px] text-slate-500 uppercase mb-1">Wasted</div>
                    <span className="text-amber-400">{formatNumber(idle.idleCapacity)} t/hr</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[9px] text-slate-500 uppercase mb-1">Idle Cost</div>
                    <span className="text-purple-400">{formatCurrency(idle.idleCostPerHour)}/hr</span>
                  </div>
                </div>
                {/* Idle bar */}
                <div className="mt-2 h-2 bg-slate-900 rounded overflow-hidden">
                  <div className="h-full flex">
                    <div 
                      className="bg-gradient-to-r from-cyan-600 to-cyan-500"
                      style={{ width: `${100 - idle.idlePercent}%` }}
                    />
                    <div 
                      className="bg-gradient-to-r from-amber-600 to-amber-500 animate-pulse"
                      style={{ width: `${idle.idlePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations - Industrial Alert Panel */}
      {result && result.recommendations.length > 0 && (
        <div className="industrial-card overflow-hidden">
          <div className="panel-header bg-green-950/30 border-green-800/30">
            <Lightbulb className="w-4 h-4 text-green-500" />
            <span className="text-[10px] font-mono text-green-400 uppercase tracking-widest">Balancing Recommendations</span>
          </div>
          <div className="p-4 space-y-3">
            {result.recommendations.map((rec, idx) => {
              const isPrimaryRec = rec.additionalUnitsNeeded > 0;
              return (
                <div 
                  key={idx} 
                  className={`flex items-start gap-3 p-3 rounded border ${
                    isPrimaryRec 
                      ? "bg-green-950/30 border-green-800/50" 
                      : "bg-slate-800/50 border-slate-700/50"
                  }`}
                >
                  <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                    isPrimaryRec 
                      ? "bg-green-900/50 border border-green-700/50" 
                      : "bg-amber-900/50 border border-amber-700/50"
                  }`}>
                    {isPrimaryRec 
                      ? <Plus className="w-3 h-3 text-green-400" />
                      : <AlertTriangle className="w-3 h-3 text-amber-400" />
                    }
                  </div>
                  <div className="flex-1">
                    {isPrimaryRec ? (
                      <>
                        <p className="text-sm font-bold text-green-400">
                          🎯 Add {rec.additionalUnitsNeeded} {rec.constrainedMachineName}(s)
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          Match capacity of <span className="text-cyan-400">{rec.constrainingMachineName}</span> ({formatNumber(rec.currentGap + result.maxThroughputPerHour)} t/hr)
                        </p>
                        <p className="text-[10px] text-green-400/80 mt-1 font-mono">
                          POTENTIAL GAIN: +{formatNumber(rec.potentialGain)} t/hr → Total: {formatNumber(result.maxThroughputPerHour + rec.potentialGain)} t/hr
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-slate-300">
                          <strong className="text-amber-400">{rec.constrainedMachineName}</strong>
                        </p>
                        <p className="text-sm text-amber-400/80 mt-1 font-mono">
                          {rec.recommendedAction}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Note - Theory of Constraints */}
      <div className="industrial-card p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-slate-300 tracking-wide">Theory of Constraints Applied</p>
            <p className="text-sm text-slate-500 mt-1 font-mono leading-relaxed">
              Line output is limited by the slowest machine (bottleneck). 
              Adding capacity to non-bottleneck machines will NOT increase production until the constraint is resolved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
