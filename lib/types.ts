/**
 * Eagle OTR Ops Suite - Type Definitions
 * ==========================================
 */

// -------------------- USER TYPES --------------------

export type UserRole = "ADMIN" | "MANAGER" | "OPERATOR";

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// -------------------- PROJECT TYPES --------------------

export type ProjectStatus = "ACTIVE" | "ARCHIVED" | "PLANNING";
export type ProjectRole = "OWNER" | "EDITOR" | "VIEWER";

export interface Project {
  id: string;
  name: string;
  location: string | null;
  clientName: string | null;
  description: string | null;
  
  // Operational rates
  electricityRate: number;  // $/kWh
  fuelRate: number;         // $/gallon
  laborRate: number;        // $/hour
  waterRate: number;        // $/gallon
  
  // Operating parameters
  shiftsPerDay: number;
  hoursPerShift: number;
  operatingDaysYear: number;
  
  // Tire specs
  avgTireWeightKg: number;
  tireSizeCategory: string;
  
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  joinedAt: Date;
  user?: User;
}

export interface ProjectWithMembers extends Project {
  members: ProjectMember[];
  fleet: ProjectMachine[];
  _count?: {
    simulations: number;
    reports: number;
  };
}

// -------------------- MACHINE TYPES --------------------

export type MachineStatus = "OPERATIONAL" | "MAINTENANCE" | "OFFLINE" | "DECOMMISSIONED";

export interface MachineTemplate {
  id: number;
  machineCode: string;
  name: string;
  fullName: string;
  function: string;
  
  // Cycle time (minutes)
  cycleTimeMin: number;
  cycleTimeMax: number;
  cycleTimeTypical: number;
  
  // Throughput (tires/hour)
  throughputMin: number;
  throughputMax: number;
  throughputTypical: number;
  
  // Power/energy
  powerKw: number;
  fuelGallonsHour: number;
  
  // Costs
  maintenanceCostHour: number;
  operatorsRequired: number;
  
  categoryId: number | null;
  notes: string[];
}

export interface ProjectMachine {
  id: string;
  projectId: string;
  templateId: number;
  template?: MachineTemplate;
  
  quantity: number;
  serialNumbers: string[];
  installDate: Date | null;
  status: MachineStatus;
  
  customThroughput: number | null;
  customPowerKw: number | null;
  notes: string | null;
}

// -------------------- SIMULATION TYPES --------------------

export type SimulationStatus = "DRAFT" | "CALCULATED" | "APPROVED" | "ARCHIVED";

export interface SimulationMachine {
  id: string;
  simulationId: string;
  templateId: number;
  template?: MachineTemplate;
  
  quantity: number;
  effectiveThroughput: number;
  utilizationPercent: number;
  isBottleneck: boolean;
  
  laborCost: number;
  energyCost: number;
  maintenanceCost: number;
}

export interface Simulation {
  id: string;
  name: string;
  description: string | null;
  projectId: string;
  userId: string;
  
  // Parameters
  shiftsPerDay: number;
  hoursPerShift: number;
  operatingDays: number;
  useTypicalRates: boolean;
  tireSizeCategory: string;
  tireWeightKg: number;
  
  // Production results
  tiresPerHour: number;
  tiresPerShift: number;
  tiresPerYear: number;
  bottleneckMachine: string | null;
  
  // Weight results
  tonsPerShift: number;
  tonsPerYear: number;
  rubberTonsPerYear: number;
  
  // Cost results
  laborCostYear: number;
  energyCostYear: number;
  maintenanceCostYear: number;
  totalOpexYear: number;
  costPerTire: number;
  costPerTon: number;
  
  // Revenue
  revenuePerTonRubber: number;
  potentialRevenue: number;
  estimatedProfit: number;
  
  status: SimulationStatus;
  createdAt: Date;
  updatedAt: Date;
  
  machines?: SimulationMachine[];
  project?: Project;
}

export interface SimulationInput {
  name: string;
  description?: string;
  projectId: string;
  machines: {
    templateId: number;
    quantity: number;
  }[];
  shiftsPerDay?: number;
  hoursPerShift?: number;
  operatingDays?: number;
  useTypicalRates?: boolean;
  tireSizeCategory?: string;
  revenuePerTonRubber?: number;
}

// -------------------- REPORT TYPES --------------------

export type ReportType = 
  | "PRODUCTION_ANALYSIS"
  | "COST_BREAKDOWN"
  | "ROI_PROJECTION"
  | "FLEET_SUMMARY"
  | "EXECUTIVE_SUMMARY"
  | "SPARE_PARTS_QUOTE";

export type ReportStatus = "DRAFT" | "GENERATING" | "READY" | "SENT";

export interface ReportSection {
  title: string;
  type: "text" | "table" | "chart" | "metrics";
  content: any;
}

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  projectId: string;
  simulationId: string | null;
  userId: string;
  
  summary: string | null;
  sections: ReportSection[];
  cloudStoragePath: string | null;
  isPublic: boolean;
  
  status: ReportStatus;
  generatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  project?: Project;
  simulation?: Simulation;
}

// -------------------- LEGACY TYPES (Spare Parts) --------------------

export interface Category {
  id: number;
  name: string;
  displayOrder: number;
  parts: Part[];
}

export interface Part {
  id: number;
  name: string;
  partType: string;
  defaultQty: number;
  defaultPrice: number;
  categoryId: number;
}

export interface LineItem {
  partId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Scenario {
  id: string;
  name: string;
  userId: string;
  grandTotal: number;
  items: ScenarioItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScenarioItem {
  id: string;
  scenarioId: string;
  partId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CategorySubtotal {
  categoryId: number;
  categoryName: string;
  subtotal: number;
  percentage: number;
}

// -------------------- API RESPONSE TYPES --------------------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
