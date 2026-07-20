import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import {
  calculateLineThroughput,
  calculateAnnualProduction,
  getMachineSpecs,
  getTireWeightOptions,
  SelectedMachine
} from "@/lib/production-calculator";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return available options for the calculator
    return NextResponse.json({
      machines: getMachineSpecs(),
      tireWeights: getTireWeightOptions()
    });
  } catch (error) {
    console.error("Error fetching production options:", error);
    return NextResponse.json(
      { error: "Failed to fetch production options" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      machines,
      tireSizeCategory = "medium",
      useTypicalRates = true,
      shiftsPerDay = 1,
      operatingDaysPerYear = 250
    } = body as {
      machines: SelectedMachine[];
      tireSizeCategory?: string;
      useTypicalRates?: boolean;
      shiftsPerDay?: number;
      operatingDaysPerYear?: number;
    };

    if (!machines || machines.length === 0) {
      return NextResponse.json(
        { error: "At least one machine must be selected" },
        { status: 400 }
      );
    }

    // Calculate line throughput
    const lineThroughput = calculateLineThroughput(
      machines,
      tireSizeCategory,
      useTypicalRates
    );

    // Calculate annual production
    const annualProduction = calculateAnnualProduction(
      lineThroughput,
      shiftsPerDay,
      operatingDaysPerYear
    );

    return NextResponse.json({
      lineThroughput,
      annualProduction
    });
  } catch (error) {
    console.error("Error calculating production:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Calculation failed" },
      { status: 500 }
    );
  }
}
