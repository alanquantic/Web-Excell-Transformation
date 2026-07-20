import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const scenarios = await prisma.scenario.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        grandTotal: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(scenarios);
  } catch (error) {
    console.error("Error fetching scenarios:", error);
    return NextResponse.json({ error: "Failed to fetch scenarios" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { name, items, grandTotal } = await request.json();

    if (!name || !items) {
      return NextResponse.json({ error: "Name and items are required" }, { status: 400 });
    }

    const scenario = await prisma.scenario.create({
      data: {
        name,
        userId,
        grandTotal: grandTotal || 0,
        items: {
          create: items.map((item: any) => ({
            partId: item.partId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal
          }))
        }
      },
      include: { items: true }
    });

    return NextResponse.json(scenario);
  } catch (error) {
    console.error("Error creating scenario:", error);
    return NextResponse.json({ error: "Failed to create scenario" }, { status: 500 });
  }
}
