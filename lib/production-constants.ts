/**
 * Eagle Production Constants
 * Official specifications from Eagle International technical documentation
 * Source: OTRDebeader.pdf, PunchCutterII.pdf, TitanII.pdf
 */

export interface MachineSpec {
  id: string;
  name: string;
  fullName: string;
  function: string;
  cycleTimeMinutes: {
    min: number;
    max: number;
    typical: number;
  };
  throughputPerHour: {
    min: number;
    max: number;
    typical: number;
  };
  notes: string[];
}

export interface TireWeightSpec {
  sizeCategory: string;
  description: string;
  weightKg: number;
  weightLbs: number;
}

// Machine specifications from official documentation
export const MACHINE_SPECS: Record<string, MachineSpec> = {
  OTR_DEBEADER: {
    id: "OTR_DEBEADER",
    name: "OTR Debeader",
    fullName: "Eagle OTR Debeader",
    function: "Remove steel beads from OTR tires",
    cycleTimeMinutes: {
      min: 8,
      max: 10,
      typical: 9
    },
    throughputPerHour: {
      min: 6,
      max: 8,
      typical: 7
    },
    notes: [
      "Removes steel bead wires from tire",
      "First step in tire processing line",
      "Hydraulic operation"
    ]
  },
  PUNCH_CUTTER_II: {
    id: "PUNCH_CUTTER_II",
    name: "Punch Cutter II",
    fullName: "Eagle Punch Cutter II",
    function: "Bagel cut - cuts tire in half horizontally",
    cycleTimeMinutes: {
      min: 8,
      max: 10,
      typical: 8 // 8 min in automatic mode
    },
    throughputPerHour: {
      min: 4,
      max: 6,
      typical: 5 // 4-5 standard, up to 6 max
    },
    notes: [
      "Performs 'Bagel' cut (horizontal halving)",
      "Automatic mode: ~8 minutes per tire",
      "Standard production: 4-5 tires/hour",
      "Maximum production: up to 6 tires/hour"
    ]
  },
  TITAN_II: {
    id: "TITAN_II",
    name: "Titan II",
    fullName: "Eagle Titan II",
    function: "Cut tire halves into manageable segments",
    cycleTimeMinutes: {
      min: 10,
      max: 15,
      typical: 12
    },
    throughputPerHour: {
      min: 4,
      max: 5,
      typical: 4
    },
    notes: [
      "Cuts tire into segments for further processing",
      "40/57 tire: 24 pieces in ~30 mins (2 halves)",
      "Often the bottleneck in a complete line",
      "Processes tire halves from Punch Cutter"
    ]
  }
};

// Tire weight specifications by size category
export const TIRE_WEIGHTS: TireWeightSpec[] = [
  { sizeCategory: "small", description: "Small OTR (17.5-25)", weightKg: 150, weightLbs: 330 },
  { sizeCategory: "medium", description: "Medium OTR (23.5-25)", weightKg: 300, weightLbs: 661 },
  { sizeCategory: "large", description: "Large OTR (29.5-25)", weightKg: 450, weightLbs: 992 },
  { sizeCategory: "xlarge", description: "XL OTR (33.00-51)", weightKg: 800, weightLbs: 1764 },
  { sizeCategory: "giant", description: "Giant OTR (40/65-39)", weightKg: 1500, weightLbs: 3307 },
  { sizeCategory: "ultra", description: "Ultra (53/80-63)", weightKg: 2500, weightLbs: 5512 },
  { sizeCategory: "mega", description: "Mega (59/80-63)", weightKg: 4000, weightLbs: 8818 }
];

// Default tire weight for calculations (Medium OTR)
export const DEFAULT_TIRE_WEIGHT_KG = 300;
export const DEFAULT_TIRE_WEIGHT_LBS = 661;

// Shift duration constants
export const SHIFT_HOURS = 8;
export const EFFICIENCY_FACTOR = 0.85; // 85% efficiency accounting for breaks, changeovers, etc.

// Rubber recovery percentage (typical)
export const RUBBER_RECOVERY_PERCENTAGE = 0.70; // 70% of tire weight is recoverable rubber
