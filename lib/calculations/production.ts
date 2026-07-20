/**
 * Eagle OTR Ops Suite - Production Calculator
 * =============================================
 * Implements Theory of Constraints (TOC) for production line analysis
 * 
 * Key Principle: The production output of the entire line is LIMITED
 * by the SLOWEST machine (the bottleneck). Adding more capacity to
 * non-bottleneck machines does NOT increase total output.
 */

import {
  EagleMachineSpec,
  EAGLE_MACHINES,
  TireWeightCategory,
  TIRE_WEIGHT_CATEGORIES,
  DEFAULT_OPERATING_PARAMS,
  PowerType
} from "../constants/eagle-specs";

// ==================== TYPES ====================

export interface MachineConfiguration {
  machineCode: string;
  quantity: number;
  powerType: PowerType;
}

export interface MachineAnalysis {
  machineCode: string;
  machineName: string;
  quantity: number;
  
  // Throughput
  throughputPerMachine: number;  // tires/hour per unit
  totalThroughput: number;       // tires/hour total (qty × rate)
  
  // Bottleneck analysis
  isBottleneck: boolean;
  utilizationPercent: number;    // How much capacity is actually used
  excessCapacity: number;        // Unused capacity (tires/hour)
  
  // Cost breakdown
  powerConsumptionKw: number;
  laborCostPerHour: number;
  energyCostPerHour: number;
  maintenanceCostPerHour: number;
  totalCostPerHour: number;
}

export interface BottleneckRecommendation {
  constrainedMachineCode: string;
  constrainedMachineName: string;
  constrainingMachineCode: string;
  constrainingMachineName: string;
  currentGap: number;            // tires/hour being lost
  recommendedAction: string;
  additionalUnitsNeeded: number;
  potentialGain: number;         // Additional tires/hour if resolved
}

export interface IdleCapacityMetrics {
  machineCode: string;
  machineName: string;
  totalCapacity: number;         // Maximum possible throughput
  actualFlow: number;            // Current line flow (bottleneck)
  idleCapacity: number;          // Wasted capacity
  idlePercent: number;           // % of capacity sitting idle
  idleCostPerHour: number;       // Cost of running machines at idle
}

// Station-to-station flow imbalance for "+1 UNIT" indicators
export interface StationFlowImbalance {
  fromMachineCode: string;
  fromMachineName: string;
  toMachineCode: string;
  toMachineName: string;
  fromCapacity: number;
  toCapacity: number;
  capacityGap: number;
  unitsNeededToBalance: number;
  needsRebalance: boolean;
  isBlockage: boolean;  // True if this transition has the bottleneck
}

export interface SimulationResult {
  // Summary
  isValid: boolean;
  validationErrors: string[];
  
  // Bottleneck identification
  bottleneckMachineCode: string;
  bottleneckMachineName: string;
  
  // Production metrics
  maxThroughputPerHour: number;  // Line output (limited by bottleneck)
  tiresPerShift: number;
  tiresPerDay: number;
  tiresPerYear: number;
  
  // Weight metrics
  tireWeightKg: number;
  kgPerShift: number;
  tonsPerShift: number;
  tonsPerYear: number;
  rubberTonsPerYear: number;     // Recoverable rubber
  
  // Efficiency score (0-100)
  efficiencyScore: number;       // How balanced is the line?
  
  // Cost analysis
  totalCostPerHour: number;
  laborCostPerHour: number;
  energyCostPerHour: number;
  maintenanceCostPerHour: number;
  
  costPerTire: number;
  costPerTon: number;
  
  // Annual costs
  laborCostPerYear: number;
  energyCostPerYear: number;
  maintenanceCostPerYear: number;
  totalOpexPerYear: number;
  
  // Revenue potential
  rubberRevenuePerYear: number;
  estimatedProfitPerYear: number;
  
  // Machine-by-machine analysis
  machineAnalysis: MachineAnalysis[];
  
  // Idle capacity analysis
  idleMetrics: IdleCapacityMetrics[];
  totalIdleCapacity: number;        // Total idle throughput across all non-bottleneck machines
  totalIdleCostPerHour: number;     // Cost of idle capacity per hour
  
  // Cascade flow analysis
  maxPossibleThroughput: number;    // If line were perfectly balanced
  throughputLoss: number;           // Gap between max possible and actual
  
  // Station-to-station flow imbalances (for "+1 UNIT" indicators)
  flowImbalances: StationFlowImbalance[];
  
  // Recommendations
  recommendations: BottleneckRecommendation[];
  
  // Configuration used
  config: {
    shiftsPerDay: number;
    hoursPerShift: number;
    operatingDaysPerYear: number;
    efficiencyFactor: number;
    tireSizeCategory: string;
    laborRate: number;
    electricityRate: number;
    dieselRate: number;
    rubberPrice: number;
  };
}

export interface SimulationInput {
  machines: MachineConfiguration[];
  tireSizeCategory?: string;
  shiftsPerDay?: number;
  hoursPerShift?: number;
  operatingDaysPerYear?: number;
  efficiencyFactor?: number;
  laborRate?: number;
  electricityRate?: number;
  dieselRate?: number;
  rubberPrice?: number;
  useTypicalRates?: boolean;  // true = typical, false = max rates
}

// ==================== MAIN CALCULATION FUNCTION ====================

/**
 * Calculate production line throughput using Theory of Constraints
 * 
 * @param input - Machine configuration and operating parameters
 * @returns Complete simulation results including bottleneck analysis
 */
export function calculateProduction(input: SimulationInput): SimulationResult {
  const {
    machines,
    tireSizeCategory = "medium",
    shiftsPerDay = DEFAULT_OPERATING_PARAMS.shiftsPerDay,
    hoursPerShift = DEFAULT_OPERATING_PARAMS.hoursPerShift,
    operatingDaysPerYear = DEFAULT_OPERATING_PARAMS.operatingDaysPerYear,
    efficiencyFactor = DEFAULT_OPERATING_PARAMS.efficiencyFactor,
    laborRate = DEFAULT_OPERATING_PARAMS.laborRatePerHour,
    electricityRate = DEFAULT_OPERATING_PARAMS.electricityRatePerKwh,
    dieselRate = DEFAULT_OPERATING_PARAMS.dieselRatePerGallon,
    rubberPrice = DEFAULT_OPERATING_PARAMS.rubberPricePerTon,
    useTypicalRates = true
  } = input;

  // Validation
  const validationErrors: string[] = [];
  
  if (!machines || machines.length === 0) {
    validationErrors.push("At least one machine must be configured");
  }

  // Get tire weight
  const tireCategory = TIRE_WEIGHT_CATEGORIES.find(t => t.id === tireSizeCategory)
    || TIRE_WEIGHT_CATEGORIES.find(t => t.id === "medium")!;
  const tireWeightKg = tireCategory.weightKg;
  const rubberPercentage = tireCategory.rubberPercentage;

  // Analyze each machine
  const machineAnalysis: MachineAnalysis[] = machines.map(config => {
    const spec = EAGLE_MACHINES[config.machineCode];
    
    if (!spec) {
      validationErrors.push(`Unknown machine code: ${config.machineCode}`);
      return null;
    }

    const throughputPerMachine = useTypicalRates
      ? spec.production.tiresPerHourTypical
      : spec.production.tiresPerHourMax;
    
    const totalThroughput = throughputPerMachine * config.quantity;

    // Get power spec for selected type
    const powerSpec = spec.powerOptions.find(p => p.type === config.powerType)
      || spec.powerOptions[0];

    // Calculate costs per hour
    const laborCostPerHour = spec.operatorsRequired * config.quantity * laborRate;
    
    let energyCostPerHour = 0;
    if (config.powerType === "ELECTRIC") {
      energyCostPerHour = powerSpec.kilowatts * config.quantity * electricityRate;
    } else {
      energyCostPerHour = (powerSpec.fuelConsumptionGph || 0) * config.quantity * dieselRate;
    }
    
    const maintenanceCostPerHour = spec.maintenanceCostPerHour * config.quantity;
    const totalCostPerHour = laborCostPerHour + energyCostPerHour + maintenanceCostPerHour;

    return {
      machineCode: config.machineCode,
      machineName: spec.name,
      quantity: config.quantity,
      throughputPerMachine,
      totalThroughput,
      isBottleneck: false,  // Will be set below
      utilizationPercent: 100,  // Will be calculated below
      excessCapacity: 0,  // Will be calculated below
      powerConsumptionKw: powerSpec.kilowatts * config.quantity,
      laborCostPerHour,
      energyCostPerHour,
      maintenanceCostPerHour,
      totalCostPerHour
    } as MachineAnalysis;
  }).filter(Boolean) as MachineAnalysis[];

  if (validationErrors.length > 0 || machineAnalysis.length === 0) {
    return createEmptyResult(validationErrors, {
      shiftsPerDay,
      hoursPerShift,
      operatingDaysPerYear,
      efficiencyFactor,
      tireSizeCategory,
      laborRate,
      electricityRate,
      dieselRate,
      rubberPrice
    });
  }

  // ==================== THEORY OF CONSTRAINTS ====================
  // CASCADE FLOW: Output is STRICTLY the minimum throughput (bottleneck)
  const minThroughput = Math.min(...machineAnalysis.map(m => m.totalThroughput));
  const maxThroughput = Math.max(...machineAnalysis.map(m => m.totalThroughput));
  
  // Sort machines by line position (flow order) for bottleneck priority
  const sortedByLinePosition = [...machineAnalysis].sort((a, b) => {
    const specA = EAGLE_MACHINES[a.machineCode];
    const specB = EAGLE_MACHINES[b.machineCode];
    return (specA?.linePosition || 0) - (specB?.linePosition || 0);
  });
  
  // Find the FIRST machine in the flow that has the minimum throughput
  // (This is critical: if two stations have equal minimum, the first one stops material flow)
  const firstBottleneckInFlow = sortedByLinePosition.find(m => m.totalThroughput === minThroughput);
  
  // Mark bottleneck and calculate utilization
  machineAnalysis.forEach(machine => {
    // Only mark the FIRST station with min throughput as THE bottleneck
    machine.isBottleneck = machine.machineCode === firstBottleneckInFlow?.machineCode;
    // Utilization = actual flow vs capacity (bottleneck is 100% utilized)
    machine.utilizationPercent = (minThroughput / machine.totalThroughput) * 100;
    machine.excessCapacity = machine.totalThroughput - minThroughput;
  });

  const bottleneck = machineAnalysis.find(m => m.isBottleneck)!;
  
  // ==================== IDLE CAPACITY ANALYSIS ====================
  // Calculate how much capacity is sitting idle at each non-bottleneck station
  const idleMetrics: IdleCapacityMetrics[] = machineAnalysis
    .filter(m => !m.isBottleneck)
    .map(machine => {
      const idleCapacity = machine.totalThroughput - minThroughput;
      const idlePercent = (idleCapacity / machine.totalThroughput) * 100;
      // Cost of running machines at idle (still paying labor, energy, maintenance)
      const idleCostPerHour = machine.totalCostPerHour * (idleCapacity / machine.totalThroughput);
      
      return {
        machineCode: machine.machineCode,
        machineName: machine.machineName,
        totalCapacity: machine.totalThroughput,
        actualFlow: minThroughput,
        idleCapacity,
        idlePercent,
        idleCostPerHour
      };
    });
  
  const totalIdleCapacity = idleMetrics.reduce((sum, m) => sum + m.idleCapacity, 0);
  const totalIdleCostPerHour = idleMetrics.reduce((sum, m) => sum + m.idleCostPerHour, 0);
  const throughputLoss = maxThroughput - minThroughput;

  // Calculate efficiency score (100 = perfectly balanced, 0 = very unbalanced)
  const avgUtilization = machineAnalysis.reduce((sum, m) => sum + m.utilizationPercent, 0) / machineAnalysis.length;
  const efficiencyScore = Math.round(avgUtilization);

  // ==================== STATION-TO-STATION FLOW IMBALANCES ====================
  // Calculate flow imbalances between adjacent stations for "+1 UNIT" indicators
  const flowImbalances: StationFlowImbalance[] = [];
  
  for (let i = 0; i < sortedByLinePosition.length - 1; i++) {
    const fromMachine = sortedByLinePosition[i];
    const toMachine = sortedByLinePosition[i + 1];
    
    const fromSpec = EAGLE_MACHINES[fromMachine.machineCode];
    const toSpec = EAGLE_MACHINES[toMachine.machineCode];
    
    // Calculate capacity gap (positive = downstream needs more capacity)
    const capacityGap = fromMachine.totalThroughput - toMachine.totalThroughput;
    
    // Calculate units needed for downstream station to match upstream
    const toThroughputPerUnit = useTypicalRates
      ? toSpec.production.tiresPerHourTypical
      : toSpec.production.tiresPerHourMax;
    
    const unitsNeededToBalance = capacityGap > 0 
      ? Math.ceil(capacityGap / toThroughputPerUnit) 
      : 0;
    
    // Determine if this connection shows a blockage
    // A blockage occurs when: downstream station is the bottleneck OR
    // downstream capacity < upstream capacity (material piles up)
    const isBlockage = toMachine.isBottleneck || capacityGap > 0;
    
    flowImbalances.push({
      fromMachineCode: fromMachine.machineCode,
      fromMachineName: fromMachine.machineName,
      toMachineCode: toMachine.machineCode,
      toMachineName: toMachine.machineName,
      fromCapacity: fromMachine.totalThroughput,
      toCapacity: toMachine.totalThroughput,
      capacityGap,
      unitsNeededToBalance,
      needsRebalance: capacityGap > 0.5, // Threshold to avoid noise
      isBlockage
    });
  }

  // ==================== INTELLIGENT RECOMMENDATIONS ====================
  // Find the FASTEST station to use as target for balancing
  const fastestMachine = machineAnalysis.reduce((a, b) => 
    a.totalThroughput > b.totalThroughput ? a : b
  );
  
  // Generate recommendations: How many units to ADD to bottleneck to match faster stations
  const recommendations: BottleneckRecommendation[] = [];
  
  // Primary recommendation: How to fix the bottleneck
  if (bottleneck && throughputLoss > 0) {
    const bottleneckSpec = EAGLE_MACHINES[bottleneck.machineCode];
    const bottleneckThroughputPerUnit = useTypicalRates
      ? bottleneckSpec.production.tiresPerHourTypical
      : bottleneckSpec.production.tiresPerHourMax;
    
    // Calculate how many more bottleneck units needed to match fastest station
    const additionalUnitsToMatchFastest = Math.ceil(
      (fastestMachine.totalThroughput - bottleneck.totalThroughput) / bottleneckThroughputPerUnit
    );
    
    recommendations.push({
      constrainedMachineCode: bottleneck.machineCode,
      constrainedMachineName: bottleneck.machineName,
      constrainingMachineCode: fastestMachine.machineCode,
      constrainingMachineName: fastestMachine.machineName,
      currentGap: throughputLoss,
      recommendedAction: `Add ${additionalUnitsToMatchFastest} ${bottleneck.machineName}(s) to match ${fastestMachine.machineName} (${fastestMachine.totalThroughput.toFixed(1)} t/hr)`,
      additionalUnitsNeeded: additionalUnitsToMatchFastest,
      potentialGain: throughputLoss
    });
  }
  
  // Secondary recommendations: Show idle capacity at each non-bottleneck station
  machineAnalysis.forEach(machine => {
    if (!machine.isBottleneck && machine.excessCapacity > 0.5) {
      recommendations.push({
        constrainedMachineCode: machine.machineCode,
        constrainedMachineName: machine.machineName,
        constrainingMachineCode: bottleneck.machineCode,
        constrainingMachineName: bottleneck.machineName,
        currentGap: machine.excessCapacity,
        recommendedAction: `${machine.machineName} has ${machine.excessCapacity.toFixed(1)} t/hr IDLE capacity (${(100 - machine.utilizationPercent).toFixed(0)}% wasted)`,
        additionalUnitsNeeded: 0,
        potentialGain: machine.excessCapacity
      });
    }
  });

  // ==================== PRODUCTION CALCULATIONS ====================
  const maxThroughputPerHour = minThroughput;
  const effectiveHoursPerShift = hoursPerShift * efficiencyFactor;
  const tiresPerShift = Math.floor(maxThroughputPerHour * effectiveHoursPerShift);
  const tiresPerDay = tiresPerShift * shiftsPerDay;
  const tiresPerYear = tiresPerDay * operatingDaysPerYear;

  // Weight calculations
  const kgPerShift = tiresPerShift * tireWeightKg;
  const tonsPerShift = kgPerShift / 1000;
  const tonsPerYear = (tiresPerYear * tireWeightKg) / 1000;
  const rubberTonsPerYear = tonsPerYear * rubberPercentage;

  // ==================== COST CALCULATIONS ====================
  const totalCostPerHour = machineAnalysis.reduce((sum, m) => sum + m.totalCostPerHour, 0);
  const laborCostPerHour = machineAnalysis.reduce((sum, m) => sum + m.laborCostPerHour, 0);
  const energyCostPerHour = machineAnalysis.reduce((sum, m) => sum + m.energyCostPerHour, 0);
  const maintenanceCostPerHour = machineAnalysis.reduce((sum, m) => sum + m.maintenanceCostPerHour, 0);

  const operatingHoursPerYear = hoursPerShift * shiftsPerDay * operatingDaysPerYear * efficiencyFactor;
  
  const laborCostPerYear = laborCostPerHour * operatingHoursPerYear;
  const energyCostPerYear = energyCostPerHour * operatingHoursPerYear;
  const maintenanceCostPerYear = maintenanceCostPerHour * operatingHoursPerYear;
  const totalOpexPerYear = laborCostPerYear + energyCostPerYear + maintenanceCostPerYear;

  const costPerTire = tiresPerYear > 0 ? totalOpexPerYear / tiresPerYear : 0;
  const costPerTon = tonsPerYear > 0 ? totalOpexPerYear / tonsPerYear : 0;

  // ==================== REVENUE CALCULATIONS ====================
  const rubberRevenuePerYear = rubberTonsPerYear * rubberPrice;
  const estimatedProfitPerYear = rubberRevenuePerYear - totalOpexPerYear;

  return {
    isValid: true,
    validationErrors: [],
    
    bottleneckMachineCode: bottleneck.machineCode,
    bottleneckMachineName: bottleneck.machineName,
    
    maxThroughputPerHour,
    tiresPerShift,
    tiresPerDay,
    tiresPerYear,
    
    tireWeightKg,
    kgPerShift,
    tonsPerShift,
    tonsPerYear,
    rubberTonsPerYear,
    
    efficiencyScore,
    
    totalCostPerHour,
    laborCostPerHour,
    energyCostPerHour,
    maintenanceCostPerHour,
    
    costPerTire,
    costPerTon,
    
    laborCostPerYear,
    energyCostPerYear,
    maintenanceCostPerYear,
    totalOpexPerYear,
    
    rubberRevenuePerYear,
    estimatedProfitPerYear,
    
    machineAnalysis,
    
    // Idle capacity metrics
    idleMetrics,
    totalIdleCapacity,
    totalIdleCostPerHour,
    maxPossibleThroughput: maxThroughput,
    throughputLoss,
    
    // Station-to-station flow imbalances
    flowImbalances,
    
    recommendations,
    
    config: {
      shiftsPerDay,
      hoursPerShift,
      operatingDaysPerYear,
      efficiencyFactor,
      tireSizeCategory,
      laborRate,
      electricityRate: electricityRate,
      dieselRate: dieselRate,
      rubberPrice
    }
  };
}

// Helper to create empty result for validation failures
function createEmptyResult(
  errors: string[],
  config: SimulationResult["config"]
): SimulationResult {
  return {
    isValid: false,
    validationErrors: errors,
    bottleneckMachineCode: "",
    bottleneckMachineName: "",
    maxThroughputPerHour: 0,
    tiresPerShift: 0,
    tiresPerDay: 0,
    tiresPerYear: 0,
    tireWeightKg: 0,
    kgPerShift: 0,
    tonsPerShift: 0,
    tonsPerYear: 0,
    rubberTonsPerYear: 0,
    efficiencyScore: 0,
    totalCostPerHour: 0,
    laborCostPerHour: 0,
    energyCostPerHour: 0,
    maintenanceCostPerHour: 0,
    costPerTire: 0,
    costPerTon: 0,
    laborCostPerYear: 0,
    energyCostPerYear: 0,
    maintenanceCostPerYear: 0,
    totalOpexPerYear: 0,
    rubberRevenuePerYear: 0,
    estimatedProfitPerYear: 0,
    machineAnalysis: [],
    idleMetrics: [],
    totalIdleCapacity: 0,
    totalIdleCostPerHour: 0,
    maxPossibleThroughput: 0,
    throughputLoss: 0,
    flowImbalances: [],
    recommendations: [],
    config
  };
}

/**
 * Quick helper to check if adding a machine would improve throughput
 */
export function wouldImproveThroughput(
  currentMachines: MachineConfiguration[],
  newMachineCode: string
): boolean {
  const current = calculateProduction({ machines: currentMachines });
  const withNew = calculateProduction({
    machines: [
      ...currentMachines,
      { machineCode: newMachineCode, quantity: 1, powerType: "ELECTRIC" }
    ]
  });
  
  return withNew.maxThroughputPerHour > current.maxThroughputPerHour;
}
