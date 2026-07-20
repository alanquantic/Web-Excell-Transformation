import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const scenario = await prisma.scenario.findFirst({
      where: { id: params.id, userId },
      include: {
        items: {
          include: {
            part: {
              include: { category: true }
            }
          }
        }
      }
    });

    if (!scenario) {
      return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
    }

    return NextResponse.json(scenario);
  } catch (error) {
    console.error("Error fetching scenario:", error);
    return NextResponse.json({ error: "Failed to fetch scenario" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { name, items, grandTotal } = await request.json();

    const existing = await prisma.scenario.findFirst({
      where: { id: params.id, userId }
    });

    if (!existing) {
      return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
    }

    // Delete existing items and recreate
    await prisma.scenarioItem.deleteMany({ where: { scenarioId: params.id } });

    const scenario = await prisma.scenario.update({
      where: { id: params.id },
      data: {
        name: name || existing.name,
        grandTotal: grandTotal || 0,
        items: {
          create: items?.map((item: any) => ({
            partId: item.partId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal
          })) || []
        }
      },
      include: { items: true }
    });

    return NextResponse.json(scenario);
  } catch (error) {
    console.error("Error updating scenario:", error);
    return NextResponse.json({ error: "Failed to update scenario" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const existing = await prisma.scenario.findFirst({
      where: { id: params.id, userId }
    });

    if (!existing) {
      return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
    }

    await prisma.scenario.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting scenario:", error);
    return NextResponse.json({ error: "Failed to delete scenario" }, { status: 500 });
  }
}
