import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const history = await prisma.calculationHistory.findMany({
      where: { userId },
      orderBy: { calculatedAt: "desc" },
      take: limit
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { scenarioName, grandTotal, details } = await request.json();

    const entry = await prisma.calculationHistory.create({
      data: {
        userId,
        scenarioName,
        grandTotal: grandTotal || 0,
        details: details || {}
      }
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error logging history:", error);
    return NextResponse.json({ error: "Failed to log history" }, { status: 500 });
  }
}
