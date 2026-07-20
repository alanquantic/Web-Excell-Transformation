"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Factory, Gauge, Scale, Calendar, Info } from "lucide-react";
import {
  MACHINE_SPECS,
  TIRE_WEIGHTS,
  MachineSpec,
  TireWeightSpec
} from "@/lib/production-constants";
import {
  calculateLineThroughput,
  calculateAnnualProduction,
  LineThroughputResult,
  SelectedMachine
} from "@/lib/production-calculator";

export function ProductionCalculator() {
  const [selectedMachines, setSelectedMachines] = useState<Record<string, number>>({
    OTR_DEBEADER: 1,
    PUNCH_CUTTER_II: 1,
    TITAN_II: 1
  });
  const [tireSizeCategory, setTireSizeCategory] = useState("medium");
  const [useTypicalRates, setUseTypicalRates] = useState(true);
  const [shiftsPerDay, setShiftsPerDay] = useState(1);
  const [operatingDays, setOperatingDays] = useState(250);
  const [result, setResult] = useState<LineThroughputResult | null>(null);
  const [annualResult, setAnnualResult] = useState<{ tiresPerYear: number; tonsPerYear: number; rubberTonsPerYear: number } | null>(null);

  const machineSpecs = Object.values(MACHINE_SPECS);
  const tireWeights = TIRE_WEIGHTS;

  const calculate = useCallback(() => {
    const machines: SelectedMachine[] = Object.entries(selectedMachines)
      .filter(([_, qty]) => qty > 0)
      .map(([machineId, quantity]) => ({ machineId, quantity }));

    if (machines.length === 0) {
      setResult(null);
      setAnnualResult(null);
      return;
    }

    try {
      const lineResult = calculateLineThroughput(machines, tireSizeCategory, useTypicalRates);
      setResult(lineResult);

      const annual = calculateAnnualProduction(lineResult, shiftsPerDay, operatingDays);
      setAnnualResult(annual);
    } catch (error) {
      console.error("Calculation error:", error);
    }
  }, [selectedMachines, tireSizeCategory, useTypicalRates, shiftsPerDay, operatingDays]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleMachineQuantity = (machineId: string, qty: number) => {
    setSelectedMachines(prev => ({
      ...prev,
      [machineId]: Math.max(0, qty)
    }));
  };

  const formatNumber = (num: number, decimals: number = 1) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <Factory className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Production Line Calculator</h2>
          <p className="text-sm text-gray-500">Theory of Constraints - Bottleneck Analysis</p>
        </div>
      </div>

      {/* Machine Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Gauge className="w-4 h-4" />
          Machine Configuration
        </h3>
        <div className="space-y-3">
          {machineSpecs.map(spec => (
            <div key={spec.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">{spec.name}</div>
                <div className="text-xs text-gray-500">
                  {useTypicalRates ? spec.throughputPerHour.typical : spec.throughputPerHour.max} tires/hr
                  {" "}&bull;{" "}
                  Cycle: {spec.cycleTimeMinutes.typical} min
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMachineQuantity(spec.id, (selectedMachines[spec.id] || 0) - 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-8 text-center font-medium text-gray-900">
                  {selectedMachines[spec.id] || 0}
                </span>
                <button
                  onClick={() => handleMachineQuantity(spec.id, (selectedMachines[spec.id] || 0) + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Rate Toggle */}
        <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div>
            <div className="text-sm font-medium text-gray-900">Production Rate</div>
            <div className="text-xs text-gray-500">
              {useTypicalRates ? "Typical (realistic)" : "Maximum (optimistic)"}
            </div>
          </div>
          <button
            onClick={() => setUseTypicalRates(!useTypicalRates)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              useTypicalRates ? "bg-blue-600" : "bg-orange-500"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                useTypicalRates ? "translate-x-1" : "translate-x-6"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Tire Size & Operations */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-2">
            <Scale className="w-3 h-3" /> Tire Size
          </label>
          <select
            value={tireSizeCategory}
            onChange={e => setTireSizeCategory(e.target.value)}
            className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {tireWeights.map(tw => (
              <option key={tw.sizeCategory} value={tw.sizeCategory}>
                {tw.description} ({tw.weightKg} kg)
              </option>
            ))}
          </select>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-2">
            <Calendar className="w-3 h-3" /> Shifts/Day
          </label>
          <select
            value={shiftsPerDay}
            onChange={e => setShiftsPerDay(Number(e.target.value))}
            className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={1}>1 Shift (8 hrs)</option>
            <option value={2}>2 Shifts (16 hrs)</option>
            <option value={3}>3 Shifts (24 hrs)</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Bottleneck Alert */}
          <div className={`p-4 rounded-xl border-2 ${
            result.bottleneck.isBottleneck
              ? "bg-amber-50 border-amber-300"
              : "bg-gray-50 border-gray-200"
          }`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Bottleneck Identified</h4>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium text-amber-700">{result.bottleneck.machineName}</span> is limiting your line to{" "}
                  <span className="font-semibold">{formatNumber(result.tiresPerHour)} tires/hour</span>
                </p>
              </div>
            </div>
          </div>

          {/* Machine Utilization */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Machine Utilization Analysis</h3>
            <div className="space-y-3">
              {result.machineAnalysis.map(machine => (
                <div key={machine.machineId} className="relative">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-medium ${
                      machine.isBottleneck ? "text-amber-700" : "text-gray-700"
                    }`}>
                      {machine.machineName}
                      {machine.isBottleneck && (
                        <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          BOTTLENECK
                        </span>
                      )}
                    </span>
                    <span className="text-gray-500">
                      {formatNumber(machine.throughputPerHour)} tires/hr ({formatNumber(machine.utilizationPercent, 0)}%)
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        machine.isBottleneck ? "bg-amber-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${machine.utilizationPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 flex items-start gap-1">
                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                Lower utilization means excess capacity. Consider reducing machines or adding bottleneck capacity.
              </p>
            </div>
          </div>

          {/* Production Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white">
              <div className="text-blue-100 text-xs font-medium mb-1">Per Shift (8 hrs)</div>
              <div className="text-3xl font-bold">{result.tiresPerShift}</div>
              <div className="text-blue-200 text-sm">tires processed</div>
              <div className="mt-3 pt-3 border-t border-blue-500/30">
                <div className="text-sm">
                  <span className="text-blue-200">Weight:</span>{" "}
                  <span className="font-semibold">{formatNumber(result.tonsPerShift)} tons</span>
                </div>
                <div className="text-sm">
                  <span className="text-blue-200">Rubber:</span>{" "}
                  <span className="font-semibold">{formatNumber(result.rubberTonsPerShift)} tons</span>
                </div>
              </div>
            </div>

            {annualResult && (
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-5 text-white">
                <div className="text-green-100 text-xs font-medium mb-1">Annual ({operatingDays} days)</div>
                <div className="text-3xl font-bold">{formatNumber(annualResult.tiresPerYear, 0)}</div>
                <div className="text-green-200 text-sm">tires/year</div>
                <div className="mt-3 pt-3 border-t border-green-500/30">
                  <div className="text-sm">
                    <span className="text-green-200">Weight:</span>{" "}
                    <span className="font-semibold">{formatNumber(annualResult.tonsPerYear, 0)} tons</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-green-200">Rubber:</span>{" "}
                    <span className="font-semibold">{formatNumber(annualResult.rubberTonsPerYear, 0)} tons</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
