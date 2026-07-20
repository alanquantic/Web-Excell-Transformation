import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { CalculatorClient } from "@/components/calculator/calculator-client";

export default async function CalculatorPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <CalculatorClient />;
}
