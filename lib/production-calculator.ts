/**
 * Eagle Production Calculator
 * Implements Theory of Constraints for line throughput calculations
 */

import {
  MACHINE_SPECS,
  MachineSpec,
  TIRE_WEIGHTS,
  TireWeightSpec,
  DEFAULT_TIRE_WEIGHT_KG,
  SHIFT_HOURS,
  EFFICIENCY_FACTOR,
  RUBBER_RECOVERY_PERCENTAGE
} from "./production-constants";

export interface SelectedMachine {
  machineId: string;
  quantity: number;
  useTypicalRate?: boolean; // true = typical, false = max rate
}

export interface BottleneckInfo {
  machineId: string;
  machineName: string;
  throughputPerHour: number;
  isBottleneck: boolean;
  utilizationPercent: number;
}

export interface LineThroughputResult {
  // Core metrics
  tiresPerHour: number;
  tiresPerShift: number;
  
  // Weight-based metrics
  tonsPerShift: number;
  kgPerShift: number;
  rubberTonsPerShift: number;
  rubberKgPerShift: number;
  
  // Bottleneck analysis
  bottleneck: BottleneckInfo;
  machineAnalysis: BottleneckInfo[];
  
  // Configuration used
  shiftHours: number;
  efficiencyFactor: number;
  tireWeightKg: number;
  tireSizeCategory: string;
}

/**
 * Calculate line throughput using Theory of Constraints
 * The bottleneck (slowest machine) determines total system output
 */
export function calculateLineThroughput(
  machines: SelectedMachine[],
  tireSizeCategory: string = "medium",
  useTypicalRates: boolean = true
): LineThroughputResult {
  if (machines.length === 0) {
    throw new Error("At least one machine must be selected");
  }

  // Get tire weight for selected category
  const tireSpec = TIRE_WEIGHTS.find(t => t.sizeCategory === tireSizeCategory) 
    || TIRE_WEIGHTS.find(t => t.sizeCategory === "medium")!;
  const tireWeightKg = tireSpec.weightKg;

  // Calculate effective throughput for each machine
  const machineAnalysis: BottleneckInfo[] = machines.map(selected => {
    const spec = MACHINE_SPECS[selected.machineId];
    if (!spec) {
      throw new Error(`Unknown machine: ${selected.machineId}`);
    }

    // Calculate throughput based on quantity of machines and rate setting
    const baseRate = useTypicalRates 
      ? spec.throughputPerHour.typical 
      : spec.throughputPerHour.max;
    
    const effectiveThroughput = baseRate * selected.quantity;

    return {
      machineId: selected.machineId,
      machineName: spec.name,
      throughputPerHour: effectiveThroughput,
      isBottleneck: false, // Will be set below
      utilizationPercent: 100 // Will be calculated relative to bottleneck
    };
  });

  // Find the bottleneck (minimum throughput)
  const minThroughput = Math.min(...machineAnalysis.map(m => m.throughputPerHour));
  
  // Mark bottleneck and calculate utilization percentages
  machineAnalysis.forEach(machine => {
    machine.isBottleneck = machine.throughputPerHour === minThroughput;
    // Utilization = how much capacity is used relative to bottleneck
    // Bottleneck is at 100%, others are underutilized
    machine.utilizationPercent = (minThroughput / machine.throughputPerHour) * 100;
  });

  const bottleneck = machineAnalysis.find(m => m.isBottleneck)!;

  // Calculate production metrics
  const tiresPerHour = minThroughput;
  const effectiveHours = SHIFT_HOURS * EFFICIENCY_FACTOR;
  const tiresPerShift = Math.floor(tiresPerHour * effectiveHours);

  // Weight calculations
  const kgPerShift = tiresPerShift * tireWeightKg;
  const tonsPerShift = kgPerShift / 1000;
  
  // Rubber recovery calculations
  const rubberKgPerShift = kgPerShift * RUBBER_RECOVERY_PERCENTAGE;
  const rubberTonsPerShift = rubberKgPerShift / 1000;

  return {
    tiresPerHour,
    tiresPerShift,
    tonsPerShift,
    kgPerShift,
    rubberTonsPerShift,
    rubberKgPerShift,
    bottleneck,
    machineAnalysis,
    shiftHours: SHIFT_HOURS,
    efficiencyFactor: EFFICIENCY_FACTOR,
    tireWeightKg,
    tireSizeCategory: tireSpec.sizeCategory
  };
}

/**
 * Get all available machine specifications
 */
export function getMachineSpecs(): MachineSpec[] {
  return Object.values(MACHINE_SPECS);
}

/**
 * Get all available tire weight categories
 */
export function getTireWeightOptions(): TireWeightSpec[] {
  return TIRE_WEIGHTS;
}

/**
 * Calculate annual production estimates
 */
export function calculateAnnualProduction(
  lineThroughput: LineThroughputResult,
  shiftsPerDay: number = 1,
  operatingDaysPerYear: number = 250
): {
  tiresPerYear: number;
  tonsPerYear: number;
  rubberTonsPerYear: number;
} {
  const tiresPerYear = lineThroughput.tiresPerShift * shiftsPerDay * operatingDaysPerYear;
  const tonsPerYear = lineThroughput.tonsPerShift * shiftsPerDay * operatingDaysPerYear;
  const rubberTonsPerYear = lineThroughput.rubberTonsPerShift * shiftsPerDay * operatingDaysPerYear;

  return {
    tiresPerYear,
    tonsPerYear,
    rubberTonsPerYear
  };
}
