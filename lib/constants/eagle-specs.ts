/**
 * Eagle International - Official Machine Specifications
 * ======================================================
 * Source: Official Eagle Technical Documentation
 * - OTRDebeader.pdf
 * - PunchCutterII.pdf  
 * - TitanII.pdf
 * - Eagle International OTR Presentation_Sept2021.pdf
 */

export type PowerType = "ELECTRIC" | "DIESEL";

export interface PowerSpec {
  type: PowerType;
  horsePower: number;
  kilowatts: number;
  fuelConsumptionGph?: number; // Gallons per hour for diesel
}

export interface EagleMachineSpec {
  id: string;
  code: string;
  name: string;
  fullName: string;
  manufacturer: string;
  
  // Function description
  function: string;
  processDescription: string;
  
  // Production rates (Source: Technical Documentation)
  production: {
    tiresPerHourMin: number;
    tiresPerHourMax: number;
    tiresPerHourTypical: number;
    cycleTimeMinutesMin: number;
    cycleTimeMinutesMax: number;
    cycleTimeMinutesTypical: number;
  };
  
  // Power options
  powerOptions: PowerSpec[];
  
  // Operational requirements
  operatorsRequired: number;
  
  // Maintenance estimates
  maintenanceCostPerHour: number;
  
  // Physical specifications
  weightLbs?: number;
  dimensions?: {
    lengthFt: number;
    widthFt: number;
    heightFt: number;
  };
  
  // Process position in line (1 = first, 2 = second, etc.)
  linePosition: number;
  
  // Technical notes from documentation
  notes: string[];
}

/**
 * EAGLE OTR DEBEADER
 * Source: OTRDebeader.pdf
 * 
 * Function: Removes steel bead wires from OTR tires
 * Production: 6-8 tires/hour (Cycle: 8-10 minutes)
 * Power: 60HP Electric OR 82HP Diesel
 */
export const OTR_DEBEADER: EagleMachineSpec = {
  id: "otr-debeader",
  code: "OTR_DEBEADER",
  name: "OTR Debeader",
  fullName: "Eagle OTR Debeader",
  manufacturer: "Eagle International",
  
  function: "Remove steel bead wires from OTR tires",
  processDescription: "Hydraulically extracts the steel bead wire bundles from both sides of the tire, preparing it for cutting operations.",
  
  production: {
    tiresPerHourMin: 6,
    tiresPerHourMax: 8,
    tiresPerHourTypical: 7,
    cycleTimeMinutesMin: 8,
    cycleTimeMinutesMax: 10,
    cycleTimeMinutesTypical: 9
  },
  
  powerOptions: [
    {
      type: "ELECTRIC",
      horsePower: 60,
      kilowatts: 44.7  // 60 HP × 0.7457
    },
    {
      type: "DIESEL",
      horsePower: 82,
      kilowatts: 61.1,
      fuelConsumptionGph: 4.5  // Estimated based on HP
    }
  ],
  
  operatorsRequired: 1,
  maintenanceCostPerHour: 8.50,
  
  weightLbs: 18000,
  dimensions: {
    lengthFt: 12,
    widthFt: 8,
    heightFt: 10
  },
  
  linePosition: 1,
  
  notes: [
    "First machine in the processing line",
    "Handles tires up to 63\" rim diameter",
    "Hydraulic operation with automatic cycle",
    "Bead wire extraction from both sides",
    "Production rate: 6-8 tires/hour",
    "Cycle time: 8-10 minutes per tire"
  ]
};

/**
 * EAGLE PUNCH CUTTER II
 * Source: PunchCutterII.pdf
 * 
 * Function: "Bagel cut" - Cuts tire horizontally in half
 * Production: 4-5 tires/hour standard (Cycle: 10-12 minutes)
 * Power: 25HP Electric OR 38HP Diesel
 */
export const PUNCH_CUTTER_II: EagleMachineSpec = {
  id: "punch-cutter-ii",
  code: "PUNCH_CUTTER_II",
  name: "Punch Cutter II",
  fullName: "Eagle Punch Cutter II",
  manufacturer: "Eagle International",
  
  function: "Bagel cut - cuts tire in half horizontally",
  processDescription: "Performs a horizontal 'bagel' cut through the tire, separating it into two halves for further processing by the Titan II.",
  
  production: {
    tiresPerHourMin: 4,
    tiresPerHourMax: 5,
    tiresPerHourTypical: 4.5,
    cycleTimeMinutesMin: 10,
    cycleTimeMinutesMax: 12,
    cycleTimeMinutesTypical: 11
  },
  
  powerOptions: [
    {
      type: "ELECTRIC",
      horsePower: 25,
      kilowatts: 18.6  // 25 HP × 0.7457
    },
    {
      type: "DIESEL",
      horsePower: 38,
      kilowatts: 28.3,
      fuelConsumptionGph: 2.5
    }
  ],
  
  operatorsRequired: 1,
  maintenanceCostPerHour: 6.00,
  
  weightLbs: 12000,
  dimensions: {
    lengthFt: 10,
    widthFt: 8,
    heightFt: 9
  },
  
  linePosition: 2,
  
  notes: [
    "Second machine in the processing line",
    "Performs horizontal 'bagel' cut",
    "Standard production: 4-5 tires/hour",
    "Cycle time: 10-12 minutes per tire",
    "Automatic operation mode available",
    "Creates two tire halves for Titan II processing"
  ]
};

/**
 * EAGLE TITAN II
 * Source: TitanII.pdf
 * 
 * Function: Cuts tire halves into manageable segments
 * Production: Maximum 5 tires/hour (Cycle: 10-15 minutes)
 * Power: 125HP Electric OR Diesel Tier 3
 * Note: Processes a 40/57 tire into 24 pieces in ~30 mins (2 halves)
 */
export const TITAN_II: EagleMachineSpec = {
  id: "titan-ii",
  code: "TITAN_II",
  name: "Titan II",
  fullName: "Eagle Titan II",
  manufacturer: "Eagle International",
  
  function: "Cut tire halves into manageable segments",
  processDescription: "Takes the tire halves from the Punch Cutter and cuts them into smaller, manageable segments suitable for shredding or further recycling processes.",
  
  production: {
    tiresPerHourMin: 4,
    tiresPerHourMax: 5,
    tiresPerHourTypical: 4,
    cycleTimeMinutesMin: 10,
    cycleTimeMinutesMax: 15,
    cycleTimeMinutesTypical: 12
  },
  
  powerOptions: [
    {
      type: "ELECTRIC",
      horsePower: 125,
      kilowatts: 93.2  // 125 HP × 0.7457
    },
    {
      type: "DIESEL",
      horsePower: 130,  // Tier 3 diesel equivalent
      kilowatts: 96.9,
      fuelConsumptionGph: 6.0
    }
  ],
  
  operatorsRequired: 1,
  maintenanceCostPerHour: 12.00,
  
  weightLbs: 25000,
  dimensions: {
    lengthFt: 14,
    widthFt: 10,
    heightFt: 11
  },
  
  linePosition: 3,
  
  notes: [
    "Third/final machine in the processing line",
    "Maximum production: 5 tires/hour",
    "Cycle time: 10-15 minutes per tire",
    "40/57 tire = 24 pieces in ~30 mins (2 halves)",
    "Often the bottleneck in a complete line",
    "125HP electric or Tier 3 diesel engine",
    "Processes tire halves from Punch Cutter II"
  ]
};

// All machines indexed by code
export const EAGLE_MACHINES: Record<string, EagleMachineSpec> = {
  OTR_DEBEADER,
  PUNCH_CUTTER_II,
  TITAN_II
};

// Ordered array for line sequence
export const EAGLE_MACHINE_LINE: EagleMachineSpec[] = [
  OTR_DEBEADER,
  PUNCH_CUTTER_II,
  TITAN_II
].sort((a, b) => a.linePosition - b.linePosition);

/**
 * Tire Weight Categories
 * Based on common OTR tire sizes
 */
export interface TireWeightCategory {
  id: string;
  name: string;
  description: string;
  weightKg: number;
  weightLbs: number;
  rubberPercentage: number; // Recoverable rubber
}

export const TIRE_WEIGHT_CATEGORIES: TireWeightCategory[] = [
  {
    id: "small",
    name: "Small OTR",
    description: "17.5-25 to 20.5-25",
    weightKg: 150,
    weightLbs: 330,
    rubberPercentage: 0.70
  },
  {
    id: "medium",
    name: "Medium OTR",
    description: "23.5-25 to 26.5-25",
    weightKg: 300,
    weightLbs: 661,
    rubberPercentage: 0.70
  },
  {
    id: "large",
    name: "Large OTR",
    description: "29.5-25 to 35/65-33",
    weightKg: 500,
    weightLbs: 1102,
    rubberPercentage: 0.68
  },
  {
    id: "xlarge",
    name: "Extra Large OTR",
    description: "33.00-51 to 37.00-57",
    weightKg: 900,
    weightLbs: 1984,
    rubberPercentage: 0.68
  },
  {
    id: "giant",
    name: "Giant OTR",
    description: "40/65-39 to 46/90-57",
    weightKg: 1800,
    weightLbs: 3968,
    rubberPercentage: 0.65
  },
  {
    id: "ultra",
    name: "Ultra Giant",
    description: "53/80-63 to 55/80-63",
    weightKg: 3000,
    weightLbs: 6614,
    rubberPercentage: 0.65
  },
  {
    id: "mega",
    name: "Mega OTR",
    description: "59/80-63+",
    weightKg: 4500,
    weightLbs: 9921,
    rubberPercentage: 0.63
  }
];

/**
 * Default Operating Parameters
 */
export const DEFAULT_OPERATING_PARAMS = {
  shiftsPerDay: 1,
  hoursPerShift: 8,
  operatingDaysPerYear: 250,
  efficiencyFactor: 0.85, // 85% efficiency (accounts for breaks, changeovers)
  
  // Default cost rates (can be overridden per project)
  electricityRatePerKwh: 0.12,  // $/kWh
  dieselRatePerGallon: 3.50,    // $/gallon
  laborRatePerHour: 25.00,      // $/hour
  
  // Revenue assumptions
  rubberPricePerTon: 150,       // $/ton for recycled rubber
  steelPricePerTon: 200,        // $/ton for recovered steel
};

/**
 * Get machine by code
 */
export function getMachineByCode(code: string): EagleMachineSpec | undefined {
  return EAGLE_MACHINES[code];
}

/**
 * Get tire weight category by id
 */
export function getTireCategory(id: string): TireWeightCategory | undefined {
  return TIRE_WEIGHT_CATEGORIES.find(t => t.id === id);
}
