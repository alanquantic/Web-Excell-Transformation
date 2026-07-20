"use client";

import { useState } from "react";
import {
  Building2,
  MapPin,
  User,
  FileText,
  Zap,
  Fuel,
  DollarSign,
  Clock,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check,
  Globe
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { createProject } from "@/app/actions/projects";
import { INDUSTRY_DEFAULTS, REGIONAL_PRESETS } from "@/lib/constants/project-defaults";

interface CreateProjectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
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

export function CreateProjectWizard({ open, onOpenChange, onSuccess }: CreateProjectWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: General Data
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  // Step 2: Economic Rates
  const [currency, setCurrency] = useState<Currency>("USD");
  const [electricityCost, setElectricityCost] = useState<number>(INDUSTRY_DEFAULTS.electricityCostKwH);
  const [dieselCost, setDieselCost] = useState<number>(INDUSTRY_DEFAULTS.dieselCostGallon);
  const [laborCost, setLaborCost] = useState<number>(INDUSTRY_DEFAULTS.laborCostHour);
  const [operatingHours, setOperatingHours] = useState<number>(INDUSTRY_DEFAULTS.operatingHoursShift);
  const [shiftsPerDay, setShiftsPerDay] = useState<number>(INDUSTRY_DEFAULTS.shiftsPerDay);
  const [daysPerYear, setDaysPerYear] = useState<number>(INDUSTRY_DEFAULTS.daysPerYear);

  const resetForm = () => {
    setStep(1);
    setName("");
    setClientName("");
    setLocation("");
    setDescription("");
    setCurrency("USD");
    setElectricityCost(INDUSTRY_DEFAULTS.electricityCostKwH);
    setDieselCost(INDUSTRY_DEFAULTS.dieselCostGallon);
    setLaborCost(INDUSTRY_DEFAULTS.laborCostHour);
    setOperatingHours(INDUSTRY_DEFAULTS.operatingHoursShift);
    setShiftsPerDay(INDUSTRY_DEFAULTS.shiftsPerDay);
    setDaysPerYear(INDUSTRY_DEFAULTS.daysPerYear);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const applyPreset = (key: keyof typeof REGIONAL_PRESETS) => {
    const preset = REGIONAL_PRESETS[key];
    setElectricityCost(preset.electricityCostKwH);
    setDieselCost(preset.dieselCostGallon);
    setLaborCost(preset.laborCostHour);
    setCurrency(preset.currency as Currency);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createProject({
      name: name.trim(),
      clientName: clientName.trim() || undefined,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      currency,
      electricityCostKwH: electricityCost,
      dieselCostGallon: dieselCost,
      laborCostHour: laborCost,
      operatingHoursShift: operatingHours,
      shiftsPerDay,
      daysPerYear
    });

    if (result.success) {
      resetForm();
      onSuccess();
    } else {
      setError(result.error || "Failed to create project");
    }

    setLoading(false);
  };

  const getCurrencySymbol = () => {
    return CURRENCY_OPTIONS.find(c => c.value === currency)?.symbol || "$";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Enter the basic information for your mining site project."
              : "Configure the economic rates and operating schedule."}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 py-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
          }`}>
            {step > 1 ? <Check className="w-4 h-4" /> : "1"}
          </div>
          <div className="text-sm text-gray-600">General Data</div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
          }`}>
            2
          </div>
          <div className="text-sm text-gray-600">Economic Rates</div>
        </div>

        {/* Step 1: General Data */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                Project Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g., Minera Escondida - Phase 2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client" className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                Client Name
              </Label>
              <Input
                id="client"
                placeholder="e.g., BHP Billiton"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g., Atacama Desert, Chile"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Brief description of the project..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 2: Economic Rates */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Regional Presets */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-sm font-medium text-blue-800 mb-3">Quick Setup - Regional Presets</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(REGIONAL_PRESETS).map(([key, preset]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(key as keyof typeof REGIONAL_PRESETS)}
                    className="text-xs"
                  >
                    <Globe className="w-3 h-3 mr-1" />
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                Currency
              </Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger className="h-11">
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
            </div>

            {/* Electricity Cost */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Electricity Cost
                </Label>
                <span className="text-sm font-semibold text-gray-900">
                  {getCurrencySymbol()}{electricityCost.toFixed(2)}/kWh
                </span>
              </div>
              <Slider
                value={[electricityCost]}
                onValueChange={([v]) => setElectricityCost(v)}
                min={0.02}
                max={0.50}
                step={0.01}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{getCurrencySymbol()}0.02</span>
                <span>{getCurrencySymbol()}0.50</span>
              </div>
            </div>

            {/* Diesel Cost */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-orange-500" />
                  Diesel Cost
                </Label>
                <span className="text-sm font-semibold text-gray-900">
                  {getCurrencySymbol()}{dieselCost.toFixed(2)}/gallon
                </span>
              </div>
              <Slider
                value={[dieselCost]}
                onValueChange={([v]) => setDieselCost(v)}
                min={1.00}
                max={10.00}
                step={0.10}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{getCurrencySymbol()}1.00</span>
                <span>{getCurrencySymbol()}10.00</span>
              </div>
            </div>

            {/* Labor Cost */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  Labor Cost (per hour)
                </Label>
                <span className="text-sm font-semibold text-gray-900">
                  {getCurrencySymbol()}{laborCost.toFixed(2)}/hr
                </span>
              </div>
              <Slider
                value={[laborCost]}
                onValueChange={([v]) => setLaborCost(v)}
                min={5}
                max={80}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{getCurrencySymbol()}5</span>
                <span>{getCurrencySymbol()}80</span>
              </div>
            </div>

            {/* Operating Schedule */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label className="flex items-center gap-1 text-xs">
                  <Clock className="w-3 h-3" />
                  Hours/Shift
                </Label>
                <Select
                  value={operatingHours.toString()}
                  onValueChange={(v) => setOperatingHours(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8 hours</SelectItem>
                    <SelectItem value="10">10 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1 text-xs">
                  <Clock className="w-3 h-3" />
                  Shifts/Day
                </Label>
                <Select
                  value={shiftsPerDay.toString()}
                  onValueChange={(v) => setShiftsPerDay(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 shift</SelectItem>
                    <SelectItem value="2">2 shifts</SelectItem>
                    <SelectItem value="3">3 shifts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1 text-xs">
                  <Calendar className="w-3 h-3" />
                  Days/Year
                </Label>
                <Input
                  type="number"
                  min={50}
                  max={365}
                  value={daysPerYear}
                  onChange={(e) => setDaysPerYear(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Annual Hours Summary */}
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <div className="text-xs text-gray-500">Total Operating Hours/Year</div>
              <div className="text-xl font-bold text-gray-900">
                {(operatingHours * shiftsPerDay * daysPerYear).toLocaleString()} hours
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between pt-4 border-t">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                ) : (
                  <><Check className="w-4 h-4" /> Create Project</>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
