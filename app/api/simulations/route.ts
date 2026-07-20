import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Helper to get authenticated user ID
async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  return user?.id || null;
}

// Validation schema for creating/updating simulation
const MachineConfigSchema = z.object({
  machineCode: z.string(),
  quantity: z.number().int().min(0).max(10),
  powerType: z.enum(["ELECTRIC", "DIESEL"]),
});

const SimulationInputSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  machines: z.array(MachineConfigSchema),
  tireSizeCategory: z.string(),
  shiftsPerDay: z.number().int().min(1).max(3),
  useTypicalRates: z.boolean(),
  // Results to store
  results: z.object({
    tiresPerHour: z.number(),
    tiresPerShift: z.number(),
    tiresPerYear: z.number(),
    tonsPerShift: z.number(),
    tonsPerYear: z.number(),
    rubberTonsPerYear: z.number(),
    laborCostYear: z.number(),
    energyCostYear: z.number(),
    maintenanceCostYear: z.number(),
    totalOpexYear: z.number(),
    costPerTire: z.number(),
    costPerTon: z.number(),
    potentialRevenue: z.number(),
    estimatedProfit: z.number(),
    bottleneckMachine: z.string().nullable(),
    efficiencyScore: z.number(),
    tireWeightKg: z.number(),
    machineAnalysis: z.array(z.object({
      machineCode: z.string(),
      utilizationPercent: z.number(),
      isBottleneck: z.boolean(),
      totalThroughput: z.number(),
      laborCostPerHour: z.number(),
      energyCostPerHour: z.number(),
      maintenanceCostPerHour: z.number(),
    })),
  }),
});

// GET - List simulations for a project
export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  // Verify user has access to project
  const projectAccess = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId,
    },
  });

  if (!projectAccess) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const simulations = await prisma.simulation.findMany({
    where: { projectId },
    include: {
      machines: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(simulations);
}

// POST - Create new simulation
export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = SimulationInputSchema.parse(body);

    // Verify user has access to project with edit permission
    const projectAccess = await prisma.projectMember.findFirst({
      where: {
        projectId: validated.projectId,
        userId,
        role: { in: ["OWNER", "EDITOR"] },
      },
    });

    if (!projectAccess) {
      return NextResponse.json(
        { error: "You don't have permission to create simulations for this project" },
        { status: 403 }
      );
    }

    // Get project for rate reference
    const project = await prisma.project.findUnique({
      where: { id: validated.projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Create simulation with machines
    const simulation = await prisma.simulation.create({
      data: {
        name: validated.name,
        description: validated.description,
        projectId: validated.projectId,
        userId,
        shiftsPerDay: validated.shiftsPerDay,
        hoursPerShift: project.operatingHoursShift,
        operatingDays: project.daysPerYear,
        useTypicalRates: validated.useTypicalRates,
        tireSizeCategory: validated.tireSizeCategory,
        tireWeightKg: validated.results.tireWeightKg,
        // Results
        tiresPerHour: validated.results.tiresPerHour,
        tiresPerShift: validated.results.tiresPerShift,
        tiresPerYear: validated.results.tiresPerYear,
        tonsPerShift: validated.results.tonsPerShift,
        tonsPerYear: validated.results.tonsPerYear,
        rubberTonsPerYear: validated.results.rubberTonsPerYear,
        laborCostYear: validated.results.laborCostYear,
        energyCostYear: validated.results.energyCostYear,
        maintenanceCostYear: validated.results.maintenanceCostYear,
        totalOpexYear: validated.results.totalOpexYear,
        costPerTire: validated.results.costPerTire,
        costPerTon: validated.results.costPerTon,
        potentialRevenue: validated.results.potentialRevenue,
        estimatedProfit: validated.results.estimatedProfit,
        bottleneckMachine: validated.results.bottleneckMachine,
        efficiencyScore: validated.results.efficiencyScore,
        status: "CALCULATED",
        machines: {
          create: validated.machines
            .filter(m => m.quantity > 0)
            .map(machine => {
              const analysis = validated.results.machineAnalysis.find(
                a => a.machineCode === machine.machineCode
              );
              return {
                machineCode: machine.machineCode,
                quantity: machine.quantity,
                powerType: machine.powerType,
                effectiveThroughput: analysis?.totalThroughput || 0,
                utilizationPercent: analysis?.utilizationPercent || 0,
                isBottleneck: analysis?.isBottleneck || false,
                laborCost: analysis?.laborCostPerHour || 0,
                energyCost: analysis?.energyCostPerHour || 0,
                maintenanceCost: analysis?.maintenanceCostPerHour || 0,
              };
            }),
        },
      },
      include: {
        machines: true,
      },
    });

    return NextResponse.json(simulation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating simulation:", error);
    return NextResponse.json(
      { error: "Failed to create simulation" },
      { status: 500 }
    );
  }
}
