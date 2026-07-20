"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Building2,
  MapPin,
  Clock,
  Users,
  BarChart3,
  Zap,
  Fuel,
  DollarSign,
  MoreVertical,
  Trash2,
  Settings,
  FolderOpen,
  Loader2,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getUserProjects, deleteProject, ProjectWithRates } from "@/app/actions/projects";
import { CreateProjectWizard } from "./create-project-wizard";

export function ProjectsDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithRates[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    const result = await getUserProjects();
    if (result.success && result.data) {
      setProjects(result.data);
      setError(null);
    } else {
      setError(result.error || "Failed to load projects");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    setDeleting(true);
    const result = await deleteProject(projectToDelete);
    if (result.success) {
      setProjects(prev => prev.filter(p => p.id !== projectToDelete));
    }
    setDeleting(false);
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleProjectCreated = () => {
    setWizardOpen(false);
    fetchProjects();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-700 border-green-200";
      case "PLANNING": return "bg-blue-100 text-blue-700 border-blue-200";
      case "ARCHIVED": return "bg-gray-100 text-gray-600 border-gray-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            {/* Back Button */}
            <button
              onClick={() => router.push("/")}
              className="mt-1 w-10 h-10 bg-slate-800/80 border border-slate-600 rounded flex items-center justify-center 
                         text-slate-400 hover:text-eagle-yellow hover:border-eagle-yellow/50 hover:bg-slate-800 
                         transition-all duration-200 group"
              title="Regresar al inicio"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3 tracking-wide">
                <div className="w-10 h-10 bg-eagle-yellow/20 border border-eagle-yellow/50 rounded flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-eagle-yellow" />
                </div>
                MINING SITES
              </h1>
              <p className="text-slate-500 mt-1 font-mono text-sm">Manage project sites and operational configurations</p>
            </div>
          </div>
          
          <button
            onClick={() => setWizardOpen(true)}
            className="industrial-btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="font-bold uppercase tracking-wider">New Project</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-eagle-yellow" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-slate-400 mb-4 font-mono">{error}</p>
            <button onClick={fetchProjects} className="industrial-btn">Try Again</button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && projects.length === 0 && (
          <div className="industrial-card border-dashed border-2 border-slate-600">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                <FolderOpen className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">No projects yet</h3>
              <p className="text-slate-500 text-center mb-6 max-w-sm font-mono text-sm">
                Create your first mining site project to start configuring production simulations.
              </p>
              <button onClick={() => setWizardOpen(true)} className="industrial-btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="font-bold uppercase tracking-wider">Create First Project</span>
              </button>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && projects.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="industrial-card group cursor-pointer hover:border-eagle-yellow/50 transition-all overflow-hidden"
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              >
                {/* Status Bar */}
                <div className={`h-1 ${
                  project.status === "ACTIVE" ? "bg-green-500" : 
                  project.status === "PLANNING" ? "bg-cyan-500" : "bg-slate-600"
                }`} />
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-100 truncate group-hover:text-eagle-yellow transition tracking-wide">
                        {project.name}
                      </h3>
                      {project.clientName && (
                        <p className="text-slate-500 text-sm truncate font-mono">
                          {project.clientName}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className={`px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded ${
                        project.status === "ACTIVE" 
                          ? "bg-green-900/50 text-green-400 border border-green-700/50" 
                          : project.status === "PLANNING" 
                          ? "bg-cyan-900/50 text-cyan-400 border border-cyan-700/50"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}>
                        {project.status === "ACTIVE" ? "Active" : 
                         project.status === "PLANNING" ? "Draft" : "Archived"}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-300 hover:bg-slate-800">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-slate-200">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/projects/${project.id}`)} className="hover:bg-slate-700 cursor-pointer">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-400 hover:bg-red-950/50 cursor-pointer"
                            onClick={() => {
                              setProjectToDelete(project.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                
                  {/* Location */}
                  {project.location && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3 font-mono">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{project.location}</span>
                    </div>
                  )}

                  {/* Operating Schedule */}
                  <div className="flex items-center gap-3 text-xs font-mono mb-3">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-cyan-500" />
                      <span>{project.shiftsPerDay} Shift{project.shiftsPerDay > 1 ? "s" : ""}/day</span>
                    </div>
                    <span className="text-slate-600">|</span>
                    <div className="text-slate-400">
                      {project.operatingHoursShift}h × {project.daysPerYear} days/yr
                    </div>
                  </div>

                  {/* Cost Rates */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-700/50">
                    <div className="text-center p-2 bg-slate-800/50 rounded border border-slate-700/50">
                      <Zap className="w-3.5 h-3.5 text-yellow-500 mx-auto mb-1" />
                      <div className="text-[9px] text-slate-500 uppercase tracking-wider">Elec</div>
                      <div className="text-xs font-mono font-bold text-slate-300">
                        {formatCurrency(project.electricityCostKwH, project.currency)}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-slate-800/50 rounded border border-slate-700/50">
                      <Fuel className="w-3.5 h-3.5 text-orange-500 mx-auto mb-1" />
                      <div className="text-[9px] text-slate-500 uppercase tracking-wider">Diesel</div>
                      <div className="text-xs font-mono font-bold text-slate-300">
                        {formatCurrency(project.dieselCostGallon, project.currency)}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-slate-800/50 rounded border border-slate-700/50">
                      <DollarSign className="w-3.5 h-3.5 text-green-500 mx-auto mb-1" />
                      <div className="text-[9px] text-slate-500 uppercase tracking-wider">Labor</div>
                      <div className="text-xs font-mono font-bold text-slate-300">
                        {formatCurrency(project.laborCostHour, project.currency)}
                      </div>
                    </div>
                  </div>

                  {/* Stats Footer */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-700/50 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Users className="w-3.5 h-3.5" />
                      <span>{project.memberCount || 1} member{(project.memberCount || 1) > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>{project.simulationCount || 0} sim{(project.simulationCount || 0) !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Wizard */}
      <CreateProjectWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onSuccess={handleProjectCreated}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              and all associated simulations and reports.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</>
              ) : (
                "Delete Project"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
