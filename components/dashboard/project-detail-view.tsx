"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Settings,
  BarChart3,
  Zap,
  Fuel,
  DollarSign,
  Clock,
  Calendar,
  Save,
  Loader2,
  Globe,
  Edit3,
  Check,
  X
} from "lucide-react";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProjectRates, ProjectWithRates } from "@/app/actions/projects";
import { REGIONAL_PRESETS } from "@/lib/constants/project-defaults";
import { SimulationBuilder } from "@/components/simulations/simulation-builder";

interface ProjectDetailViewProps {
  project: ProjectWithRates;
}

type Currency = "USD" | "MXN" | "AUD" | "EUR" | "CAD" | "CLP" | "BRL";

const CURRENCY_OPTIONS: { value: Currency; label: string; symbol: string }[] = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "MXN", label: "Mexican Peso", symbol: "$" },
  { value: "AUD", label: "Australian Dollar", symbol: "A$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "CAD", label: "Canadian Dollar", symbol: "C$" },
  { value: "CLP", label: "Chilean Peso", symbol: "CLP$" },
  { value: "BRL", label: "Brazilian Real", symbol: "R$" },
];

export function ProjectDetailView({ project: initialProject }: ProjectDetailViewProps) {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [electricityCost, setElectricityCost] = useState(project.electricityCostKwH);
  const [dieselCost, setDieselCost] = useState(project.dieselCostGallon);
  const [laborCost, setLaborCost] = useState(project.laborCostHour);
  const [operatingHours, setOperatingHours] = useState(project.operatingHoursShift);
  const [shiftsPerDay, setShiftsPerDay] = useState(project.shiftsPerDay);
  const [daysPerYear, setDaysPerYear] = useState(project.daysPerYear);
  const [currency, setCurrency] = useState<Currency>(project.currency as Currency);

  const resetEdits = () => {
    setElectricityCost(project.electricityCostKwH);
    setDieselCost(project.dieselCostGallon);
    setLaborCost(project.laborCostHour);
    setOperatingHours(project.operatingHoursShift);
    setShiftsPerDay(project.shiftsPerDay);
    setDaysPerYear(project.daysPerYear);
    setCurrency(project.currency as Currency);
    setEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const result = await updateProjectRates({
      projectId: project.id,
      electricityCostKwH: electricityCost,
      dieselCostGallon: dieselCost,
      laborCostHour: laborCost,
      operatingHoursShift: operatingHours,
      shiftsPerDay,
      daysPerYear,
      currency
    });

    if (result.success && result.data) {
      setProject(result.data);
      setEditing(false);
    } else {
      setError(result.error || "Failed to save changes");
    }

    setSaving(false);
  };

  const applyPreset = (key: keyof typeof REGIONAL_PRESETS) => {
    const preset = REGIONAL_PRESETS[key];
    setElectricityCost(preset.electricityCostKwH);
    setDieselCost(preset.dieselCostGallon);
    setLaborCost(preset.laborCostHour);
    setCurrency(preset.currency as Currency);
  };

  const getCurrencySymbol = () => {
    return CURRENCY_OPTIONS.find(c => c.value === currency)?.symbol || "$";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-700 border-green-200";
      case "PLANNING": return "bg-blue-100 text-blue-700 border-blue-200";
      case "ARCHIVED": return "bg-gray-100 text-gray-600 border-gray-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button & Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/projects")}
            className="mb-4 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {project.clientName && <span>{project.clientName}</span>}
                    {project.clientName && project.location && <span>•</span>}
                    {project.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {project.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Badge className={`${getStatusColor(project.status)} border`}>
              {project.status === "ACTIVE" ? "Active" : 
               project.status === "PLANNING" ? "Draft" : "Archived"}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="config" className="gap-2">
              <Settings className="w-4 h-4" />
              Site Configuration
            </TabsTrigger>
            <TabsTrigger value="simulations" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Simulations
            </TabsTrigger>
          </TabsList>

          {/* Site Configuration Tab */}
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Economic Rates & Schedule</CardTitle>
                    <CardDescription>
                      Configure the local market rates and operating parameters for this site
                    </CardDescription>
                  </div>
                  {!editing ? (
                    <Button onClick={() => setEditing(true)} variant="outline" className="gap-2">
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={resetEdits} variant="outline" size="icon">
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <><Save className="w-4 h-4" /> Save</>  
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Regional Presets (only in edit mode) */}
                {editing && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Quick Setup - Regional Presets
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(REGIONAL_PRESETS).map(([key, preset]) => (
                        <Button
                          key={key}
                          variant="outline"
                          size="sm"
                          onClick={() => applyPreset(key as keyof typeof REGIONAL_PRESETS)}
                          className="text-xs bg-white"
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Currency */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <DollarSign className="w-4 h-4" />
                    Currency
                  </Label>
                  {editing ? (
                    <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.symbol} - {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-lg font-semibold">
                      {CURRENCY_OPTIONS.find(c => c.value === currency)?.label} ({currency})
                    </div>
                  )}
                </div>

                {/* Cost Rates Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Electricity */}
                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="flex items-center gap-2 text-yellow-800">
                        <Zap className="w-4 h-4" />
                        Electricity
                      </Label>
                      <span className="text-lg font-bold text-yellow-900">
                        {getCurrencySymbol()}{electricityCost.toFixed(2)}/kWh
                      </span>
                    </div>
                    {editing ? (
                      <>
                        <Slider
                          value={[electricityCost]}
                          onValueChange={([v]) => setElectricityCost(v)}
                          min={0.02}
                          max={0.50}
                          step={0.01}
                          className="py-2"
                        />
                        <div className="flex justify-between text-xs text-yellow-600 mt-1">
                          <span>{getCurrencySymbol()}0.02</span>
                          <span>{getCurrencySymbol()}0.50</span>
                        </div>
                      </>
                    ) : null}
                  </div>

                  {/* Diesel */}
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="flex items-center gap-2 text-orange-800">
                        <Fuel className="w-4 h-4" />
                        Diesel
                      </Label>
                      <span className="text-lg font-bold text-orange-900">
                        {getCurrencySymbol()}{dieselCost.toFixed(2)}/gal
                      </span>
                    </div>
                    {editing ? (
                      <>
                        <Slider
                          value={[dieselCost]}
                          onValueChange={([v]) => setDieselCost(v)}
                          min={1.00}
                          max={10.00}
                          step={0.10}
                          className="py-2"
                        />
                        <div className="flex justify-between text-xs text-orange-600 mt-1">
                          <span>{getCurrencySymbol()}1.00</span>
                          <span>{getCurrencySymbol()}10.00</span>
                        </div>
                      </>
                    ) : null}
                  </div>

                  {/* Labor */}
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="flex items-center gap-2 text-green-800">
                        <DollarSign className="w-4 h-4" />
                        Labor
                      </Label>
                      <span className="text-lg font-bold text-green-900">
                        {getCurrencySymbol()}{laborCost.toFixed(2)}/hr
                      </span>
                    </div>
                    {editing ? (
                      <>
                        <Slider
                          value={[laborCost]}
                          onValueChange={([v]) => setLaborCost(v)}
                          min={5}
                          max={80}
                          step={1}
                          className="py-2"
                        />
                        <div className="flex justify-between text-xs text-green-600 mt-1">
                          <span>{getCurrencySymbol()}5</span>
                          <span>{getCurrencySymbol()}80</span>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Operating Schedule */}
                <div className="pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Operating Schedule
                  </h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <Label className="text-xs text-gray-500">Hours/Shift</Label>
                      {editing ? (
                        <Select
                          value={operatingHours.toString()}
                          onValueChange={(v) => setOperatingHours(Number(v))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="8">8 hours</SelectItem>
                            <SelectItem value="10">10 hours</SelectItem>
                            <SelectItem value="12">12 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-xl font-bold text-gray-900 mt-1">{operatingHours}h</div>
                      )}
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <Label className="text-xs text-gray-500">Shifts/Day</Label>
                      {editing ? (
                        <Select
                          value={shiftsPerDay.toString()}
                          onValueChange={(v) => setShiftsPerDay(Number(v))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 shift</SelectItem>
                            <SelectItem value="2">2 shifts</SelectItem>
                            <SelectItem value="3">3 shifts</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-xl font-bold text-gray-900 mt-1">{shiftsPerDay}</div>
                      )}
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <Label className="text-xs text-gray-500">Days/Year</Label>
                      {editing ? (
                        <Input
                          type="number"
                          min={50}
                          max={365}
                          value={daysPerYear}
                          onChange={(e) => setDaysPerYear(Number(e.target.value))}
                          className="mt-1"
                        />
                      ) : (
                        <div className="text-xl font-bold text-gray-900 mt-1">{daysPerYear}</div>
                      )}
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <Label className="text-xs text-blue-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Total Hours/Year
                      </Label>
                      <div className="text-xl font-bold text-blue-900 mt-1">
                        {(operatingHours * shiftsPerDay * daysPerYear).toLocaleString()}h
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Simulations Tab */}
          <TabsContent value="simulations">
            <Card>
              <CardHeader>
                <CardTitle>Production Simulations</CardTitle>
                <CardDescription>
                  Build and compare production line configurations using this site&apos;s rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimulationBuilder
                  projectId={project.id}
                  projectRates={{
                    electricityRate: project.electricityCostKwH,
                    dieselRate: project.dieselCostGallon,
                    laborRate: project.laborCostHour,
                    shiftsPerDay: project.shiftsPerDay,
                    hoursPerShift: project.operatingHoursShift,
                    operatingDaysPerYear: project.daysPerYear,
                    currency: project.currency
                  }}
                  onSimulationSaved={(id) => {
                    console.log("Simulation saved:", id);
                    // Could trigger a refresh of saved simulations list
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
