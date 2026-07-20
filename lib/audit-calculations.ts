// Industrial Audit Calculations with Non-Linear Wear Modeling

export interface HiddenCostResult {
  productivityLoss: number;
  maintenanceLiability: number;
  stressFactor: number;
  totalHiddenCost: number;
  energyCostPerUnit: number;
  baselineEnergyCost: number;
  currentProductivity: number;
  baselineProductivity: number;
}

export interface TroubleshootingEntry {
  id: string;
  category: string;
  severity: string;
  model: string;
  issue: string;
  technical_cause: string;
  suggested_solution: string;
  reference: string;
}

export const SEVERITY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  'Crítica': { color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/40' },
  'Alta': { color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40' },
  'Media': { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40' },
  'Baja': { color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' }
};

export const CATEGORY_CONFIG: Record<string, { icon: string; color: string }> = {
  'Hidráulica': { icon: '💧', color: 'text-blue-400' },
  'Estructural': { icon: '🏗️', color: 'text-slate-400' },
  'Energía': { icon: '⚡', color: 'text-amber-400' },
  'Corte': { icon: '✂️', color: 'text-rose-400' }
};

export interface SystemStatus {
  level: 'nominal' | 'warning' | 'critical';
  label: string;
  message: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
}

/**
 * Calculate audit metrics with industrial-grade precision
 * Uses non-linear friction modeling to reflect real steel wear physics
 */
export const calculateAuditMetrics = (
  bladeWear: number,
  unitPrice: number,
  qty: number,
  baseProductivity: number,
  hp: number,
  kwhPrice: number
): HiddenCostResult => {
  // Non-linear productivity drop coefficient (exponential after 40% wear)
  const productivityDropCoeff = bladeWear < 0.4 
    ? 0.05 * bladeWear 
    : Math.pow(bladeWear, 2.8);
  
  const currentProductivity = Math.max(1, baseProductivity * (1 - (productivityDropCoeff * 0.6)));
  const productivityLoss = baseProductivity * productivityDropCoeff * 160; // Monthly impact

  // Stress factor - exponential increase after 65% critical threshold
  const stressFactor = bladeWear > 0.65 
    ? Math.exp(bladeWear * 3.2) / 10 
    : 1 + (bladeWear * 0.4);
  
  // Maintenance liability with power function for realistic wear curve
  const maintenanceLiability = (unitPrice * qty) * Math.pow(bladeWear, 2.2);

  // Energy consumption: (HP * 0.7457) / Efficiency * Rate / Units
  const motorEfficiency = 0.88; // Real industrial motor efficiency
  const kwConsumption = (hp * 0.7457) / motorEfficiency;
  const hourlyEnergyCost = kwConsumption * kwhPrice;
  const energyCostPerUnit = hourlyEnergyCost / currentProductivity;
  
  // Baseline (0% wear) energy cost for comparison
  const baselineEnergyCost = hourlyEnergyCost / baseProductivity;

  const totalHiddenCost = productivityLoss + (maintenanceLiability * stressFactor);

  return {
    productivityLoss: Math.round(productivityLoss),
    maintenanceLiability: Math.round(maintenanceLiability),
    stressFactor: parseFloat(stressFactor.toFixed(2)),
    totalHiddenCost: Math.round(totalHiddenCost),
    energyCostPerUnit: parseFloat(energyCostPerUnit.toFixed(2)),
    baselineEnergyCost: parseFloat(baselineEnergyCost.toFixed(2)),
    currentProductivity: parseFloat(currentProductivity.toFixed(1)),
    baselineProductivity: baseProductivity
  };
};

/**
 * Get system status based on blade wear percentage
 */
export const getSystemStatus = (wear: number): SystemStatus => {
  if (wear > 0.65) {
    return {
      level: 'critical',
      label: 'CRÍTICO',
      message: 'Riesgo de Stress Hidráulico. Reemplazo Recomendado.',
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      glowColor: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]'
    };
  }
  if (wear > 0.40) {
    return {
      level: 'warning',
      label: 'PRECAUCIÓN',
      message: 'Incremento de Fricción Térmica Detectado.',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      glowColor: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]'
    };
  }
  return {
    level: 'nominal',
    label: 'NOMINAL',
    message: 'Eficiencia Optimizada - Sistema Operacional.',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    glowColor: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]'
  };
};

/**
 * Generate curve data for charts
 */
export const generateAuditCurve = (
  price: number,
  qty: number,
  tpH: number,
  kwhRate: number,
  hp: number = 125
) => {
  return Array.from({ length: 21 }, (_, i) => {
    const w = i / 20;
    const calc = calculateAuditMetrics(w, price, qty, tpH, hp, kwhRate);
    return {
      wear: `${(w * 100).toFixed(0)}%`,
      wearRaw: w,
      hiddenCost: calc.totalHiddenCost,
      energy: calc.energyCostPerUnit,
      baseline: calc.baselineEnergyCost,
      productivity: calc.currentProductivity
    };
  });
};
