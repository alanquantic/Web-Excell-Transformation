import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { ProjectsDashboard } from "@/components/dashboard/projects-dashboard";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  return <ProjectsDashboard />;
}
