import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        parts: {
          orderBy: { id: "asc" }
        }
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching parts:", error);
    return NextResponse.json({ error: "Failed to fetch parts" }, { status: 500 });
  }
}
