"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { INDUSTRY_DEFAULTS, REGIONAL_PRESETS, type RegionalPresetKey } from "@/lib/constants/project-defaults";

// Extended session user type
interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
}

async function getAuthenticatedUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const user = session.user as SessionUser;
  if (!user.id) return null;
  return user;
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

const CreateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  location: z.string().max(200).optional(),
  clientName: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  
  // Financial rates with sensible ranges
  electricityCostKwH: z.number().min(0.01).max(1.00).optional(),
  dieselCostGallon: z.number().min(0.50).max(20.00).optional(),
  laborCostHour: z.number().min(1.00).max(200.00).optional(),
  waterCostGallon: z.number().min(0.001).max(0.10).optional(),
  
  // Operating schedule
  operatingHoursShift: z.number().int().min(4).max(12).optional(),
  shiftsPerDay: z.number().int().min(1).max(3).optional(),
  daysPerYear: z.number().int().min(50).max(365).optional(),
  
  // Currency
  currency: z.enum(["USD", "MXN", "AUD", "EUR", "CAD", "CLP", "BRL"]).optional(),
  
  // Tire specs
  avgTireWeightKg: z.number().min(100).max(5000).optional(),
  tireSizeCategory: z.enum(["small", "medium", "large", "xlarge", "giant", "ultra", "mega"]).optional()
});

const UpdateRatesSchema = z.object({
  projectId: z.string().cuid(),
  
  electricityCostKwH: z.number().min(0.01).max(1.00).optional(),
  dieselCostGallon: z.number().min(0.50).max(20.00).optional(),
  laborCostHour: z.number().min(1.00).max(200.00).optional(),
  waterCostGallon: z.number().min(0.001).max(0.10).optional(),
  
  operatingHoursShift: z.number().int().min(4).max(12).optional(),
  shiftsPerDay: z.number().int().min(1).max(3).optional(),
  daysPerYear: z.number().int().min(50).max(365).optional(),
  
  currency: z.enum(["USD", "MXN", "AUD", "EUR", "CAD", "CLP", "BRL"]).optional()
});

// ============================================
// TYPES
// ============================================

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateRatesInput = z.infer<typeof UpdateRatesSchema>;

export interface ProjectWithRates {
  id: string;
  name: string;
  location: string | null;
  clientName: string | null;
  description: string | null;
  
  // Financial rates
  electricityCostKwH: number;
  dieselCostGallon: number;
  laborCostHour: number;
  waterCostGallon: number;
  
  // Operating schedule
  operatingHoursShift: number;
  shiftsPerDay: number;
  daysPerYear: number;
  
  // Settings
  currency: string;
  avgTireWeightKg: number;
  tireSizeCategory: string;
  status: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  
  // Computed values
  operatingHoursPerYear: number;
  memberCount?: number;
  simulationCount?: number;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Create a new project with default or custom rates
 * Automatically assigns the creator as OWNER
 */
export async function createProject(
  input: CreateProjectInput
): Promise<ActionResult<ProjectWithRates>> {
  try {
    // Auth check
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    // Validate input
    const validated = CreateProjectSchema.safeParse(input);
    if (!validated.success) {
      return { 
        success: false, 
        error: validated.error.errors.map(e => e.message).join(", ") 
      };
    }

    const data = validated.data;

    // Create project with industry defaults for unspecified values
    const project = await prisma.project.create({
      data: {
        name: data.name,
        location: data.location || null,
        clientName: data.clientName || null,
        description: data.description || null,
        
        // Apply defaults for financial rates
        electricityCostKwH: data.electricityCostKwH ?? INDUSTRY_DEFAULTS.electricityCostKwH,
        dieselCostGallon: data.dieselCostGallon ?? INDUSTRY_DEFAULTS.dieselCostGallon,
        laborCostHour: data.laborCostHour ?? INDUSTRY_DEFAULTS.laborCostHour,
        waterCostGallon: data.waterCostGallon ?? INDUSTRY_DEFAULTS.waterCostGallon,
        
        // Apply defaults for operating schedule
        operatingHoursShift: data.operatingHoursShift ?? INDUSTRY_DEFAULTS.operatingHoursShift,
        shiftsPerDay: data.shiftsPerDay ?? INDUSTRY_DEFAULTS.shiftsPerDay,
        daysPerYear: data.daysPerYear ?? INDUSTRY_DEFAULTS.daysPerYear,
        
        // Settings
        currency: data.currency ?? INDUSTRY_DEFAULTS.currency,
        avgTireWeightKg: data.avgTireWeightKg ?? INDUSTRY_DEFAULTS.avgTireWeightKg,
        tireSizeCategory: data.tireSizeCategory ?? INDUSTRY_DEFAULTS.tireSizeCategory,
        
        // Auto-assign creator as owner
        members: {
          create: {
            userId: user.id,
            role: "OWNER"
          }
        }
      },
      include: {
        _count: {
          select: {
            members: true,
            simulations: true
          }
        }
      }
    });

    revalidatePath("/projects");

    return {
      success: true,
      data: {
        ...project,
        operatingHoursPerYear: project.operatingHoursShift * project.shiftsPerDay * project.daysPerYear,
        memberCount: project._count.members,
        simulationCount: project._count.simulations
      }
    };
  } catch (error) {
    console.error("createProject error:", error);
    return { success: false, error: "Failed to create project" };
  }
}

/**
 * Update project financial rates and operating parameters
 * Only OWNER and EDITOR roles can update
 */
export async function updateProjectRates(
  input: UpdateRatesInput
): Promise<ActionResult<ProjectWithRates>> {
  try {
    // Auth check
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    // Validate input
    const validated = UpdateRatesSchema.safeParse(input);
    if (!validated.success) {
      return { 
        success: false, 
        error: validated.error.errors.map(e => e.message).join(", ") 
      };
    }

    const { projectId, ...updates } = validated.data;

    // Check user has permission to update
    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id
        }
      }
    });

    if (!membership) {
      return { success: false, error: "Project not found or access denied" };
    }

    if (membership.role === "VIEWER") {
      return { success: false, error: "Insufficient permissions to update rates" };
    }

    // Build update data (only include provided fields)
    const updateData: Record<string, number | string> = {};
    
    if (updates.electricityCostKwH !== undefined) {
      updateData.electricityCostKwH = updates.electricityCostKwH;
    }
    if (updates.dieselCostGallon !== undefined) {
      updateData.dieselCostGallon = updates.dieselCostGallon;
    }
    if (updates.laborCostHour !== undefined) {
      updateData.laborCostHour = updates.laborCostHour;
    }
    if (updates.waterCostGallon !== undefined) {
      updateData.waterCostGallon = updates.waterCostGallon;
    }
    if (updates.operatingHoursShift !== undefined) {
      updateData.operatingHoursShift = updates.operatingHoursShift;
    }
    if (updates.shiftsPerDay !== undefined) {
      updateData.shiftsPerDay = updates.shiftsPerDay;
    }
    if (updates.daysPerYear !== undefined) {
      updateData.daysPerYear = updates.daysPerYear;
    }
    if (updates.currency !== undefined) {
      updateData.currency = updates.currency;
    }

    // Update project
    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        _count: {
          select: {
            members: true,
            simulations: true
          }
        }
      }
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/projects");

    return {
      success: true,
      data: {
        ...project,
        operatingHoursPerYear: project.operatingHoursShift * project.shiftsPerDay * project.daysPerYear,
        memberCount: project._count.members,
        simulationCount: project._count.simulations
      }
    };
  } catch (error) {
    console.error("updateProjectRates error:", error);
    return { success: false, error: "Failed to update project rates" };
  }
}

/**
 * Get project by ID with all rates for SimulationBuilder injection
 * Validates user has access to the project
 */
export async function getProjectById(
  projectId: string
): Promise<ActionResult<ProjectWithRates>> {
  try {
    // Auth check
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    // Validate projectId format
    if (!projectId || typeof projectId !== "string") {
      return { success: false, error: "Invalid project ID" };
    }

    // Check user has access
    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id
        }
      }
    });

    if (!membership) {
      return { success: false, error: "Project not found or access denied" };
    }

    // Fetch project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: {
          select: {
            members: true,
            simulations: true
          }
        }
      }
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    return {
      success: true,
      data: {
        ...project,
        operatingHoursPerYear: project.operatingHoursShift * project.shiftsPerDay * project.daysPerYear,
        memberCount: project._count.members,
        simulationCount: project._count.simulations
      }
    };
  } catch (error) {
    console.error("getProjectById error:", error);
    return { success: false, error: "Failed to fetch project" };
  }
}

/**
 * Get all projects for the current user
 */
export async function getUserProjects(): Promise<ActionResult<ProjectWithRates[]>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const memberships = await prisma.projectMember.findMany({
      where: { userId: user.id },
      include: {
        project: {
          include: {
            _count: {
              select: {
                members: true,
                simulations: true
              }
            }
          }
        }
      },
      orderBy: {
        project: {
          updatedAt: "desc"
        }
      }
    });

    const projects: ProjectWithRates[] = memberships.map(m => ({
      ...m.project,
      operatingHoursPerYear: m.project.operatingHoursShift * m.project.shiftsPerDay * m.project.daysPerYear,
      memberCount: m.project._count.members,
      simulationCount: m.project._count.simulations
    }));

    return { success: true, data: projects };
  } catch (error) {
    console.error("getUserProjects error:", error);
    return { success: false, error: "Failed to fetch projects" };
  }
}

/**
 * Delete a project (OWNER only)
 */
export async function deleteProject(
  projectId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    // Check user is owner
    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id
        }
      }
    });

    if (!membership || membership.role !== "OWNER") {
      return { success: false, error: "Only project owners can delete projects" };
    }

    await prisma.project.delete({
      where: { id: projectId }
    });

    revalidatePath("/projects");

    return { success: true };
  } catch (error) {
    console.error("deleteProject error:", error);
    return { success: false, error: "Failed to delete project" };
  }
}

/**
 * Apply a regional preset to quickly set rates
 */
export async function applyRegionalPreset(
  projectId: string,
  presetKey: RegionalPresetKey
): Promise<ActionResult<ProjectWithRates>> {
  const preset = REGIONAL_PRESETS[presetKey];
  if (!preset) {
    return { success: false, error: "Invalid preset" };
  }

  return updateProjectRates({
    projectId,
    electricityCostKwH: preset.electricityCostKwH,
    dieselCostGallon: preset.dieselCostGallon,
    laborCostHour: preset.laborCostHour,
    currency: preset.currency as "USD" | "MXN" | "AUD" | "EUR" | "CAD" | "CLP" | "BRL"
  });
}
