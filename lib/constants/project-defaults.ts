/**
 * Project Industry Defaults and Regional Presets
 * Used for initializing new projects with sensible values
 */

// ============================================
// INDUSTRY DEFAULT VALUES
// Based on typical mining/recycling operations
// ============================================

export const INDUSTRY_DEFAULTS = {
  // Financial rates
  electricityCostKwH: 0.12,     // $/kWh - US industrial average
  dieselCostGallon: 3.50,       // $/gallon - current market
  laborCostHour: 25.00,         // $/hour - skilled operator
  waterCostGallon: 0.005,       // $/gallon - industrial rate
  
  // Operating schedule
  operatingHoursShift: 8,       // Standard 8-hour shift
  shiftsPerDay: 1,              // Single shift operation
  daysPerYear: 250,             // 5 days/week, 50 weeks
  
  // Tire specs
  avgTireWeightKg: 300,         // Medium OTR tire
  tireSizeCategory: "medium",
  
  // Financial
  currency: "USD"
} as const;

// Regional presets for quick setup
export const REGIONAL_PRESETS = {
  US_INDUSTRIAL: {
    name: "US Industrial",
    electricityCostKwH: 0.12,
    dieselCostGallon: 3.50,
    laborCostHour: 28.00,
    currency: "USD"
  },
  MEXICO_MINING: {
    name: "Mexico Mining",
    electricityCostKwH: 0.08,
    dieselCostGallon: 4.20,
    laborCostHour: 12.00,
    currency: "MXN"
  },
  AUSTRALIA_OUTBACK: {
    name: "Australia Outback",
    electricityCostKwH: 0.22,
    dieselCostGallon: 5.80,
    laborCostHour: 45.00,
    currency: "AUD"
  },
  CHILE_MINING: {
    name: "Chile Mining",
    electricityCostKwH: 0.10,
    dieselCostGallon: 4.00,
    laborCostHour: 15.00,
    currency: "USD"
  }
} as const;

export type RegionalPresetKey = keyof typeof REGIONAL_PRESETS;
