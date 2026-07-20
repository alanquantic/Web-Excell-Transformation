import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getProjectById } from "@/app/actions/projects";
import { ProjectDetailView } from "@/components/dashboard/project-detail-view";

interface PageProps {
  params: { id: string };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const result = await getProjectById(params.id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  return <ProjectDetailView project={result.data} />;
}
