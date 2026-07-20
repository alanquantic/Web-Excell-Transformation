import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { LandingContent } from "@/components/landing-content";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/calculator");
  }

  return <LandingContent />;
}
