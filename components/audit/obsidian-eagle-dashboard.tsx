"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area,
  ReferenceLine
} from 'recharts';
import {
  Activity, Zap, Gauge, ArrowRight, ShieldAlert,
  TrendingDown, Search, AlertTriangle, BookOpen,
  Thermometer, CircuitBoard, Download, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateAuditMetrics,
  getSystemStatus,
  generateAuditCurve,
  SEVERITY_CONFIG,
  CATEGORY_CONFIG,
  type HiddenCostResult,
  type TroubleshootingEntry,
  type SystemStatus
} from '@/lib/audit-calculations';

// Animated Odometer Component
const AnimatedValue: React.FC<{ value: number; prefix?: string; decimals?: number }> = ({
  value,
  prefix = '$',
  decimals = 0
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const diff = value - previousValue.current;
    if (diff === 0) return;

    const duration = 400;
    const startTime = performance.now();
    const startValue = previousValue.current;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      const current = startValue + diff * eased;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = value;
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className="font-mono tabular-nums">
      {prefix}{decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toLocaleString()}
    </span>
  );
};

// Custom Tooltip with Baseline Comparison
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    return (
      <div className="bg-slate-900/95 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-slate-500 text-[10px] font-bold uppercase mb-3 tracking-widest border-b border-slate-800 pb-2">
          Desgaste: {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between gap-8 items-center mb-2">
            <span className="text-xs text-slate-400" style={{ color: entry.color }}>
              {entry.name}:
            </span>
            <span className="text-sm font-mono font-bold text-white">
              ${entry.value.toLocaleString()}
            </span>
          </div>
        ))}
        {data?.baseline && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-emerald-500">Baseline (0%):</span>
              <span className="font-mono text-emerald-400">${data.baseline}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] mt-1">
              <span className="text-rose-500">Δ Pérdida:</span>
              <span className="font-mono text-rose-400">
                +{((data.energy - data.baseline) / data.baseline * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Status LED Component
const StatusLED: React.FC<{ status: SystemStatus }> = ({ status }) => {
  const pulseClass = status.level === 'critical' 
    ? 'animate-pulse' 
    : status.level === 'warning' 
      ? 'animate-[pulse_2s_ease-in-out_infinite]' 
      : '';

  return (
    <div className={`w-3 h-3 rounded-full ${status.bgColor} ${pulseClass}`}>
      <div className={`w-full h-full rounded-full ${status.level === 'nominal' ? 'bg-cyan-500' : status.level === 'warning' ? 'bg-amber-500' : 'bg-rose-500'} ${status.glowColor}`} />
    </div>
  );
};

// Main Dashboard Component
export default function ObsidianEagleDashboard() {
  // State
  const [wear, setWear] = useState(0.25);
  const [price, setPrice] = useState(607.23);
  const [qty, setQty] = useState(2);
  const [kwhRate, setKwhRate] = useState(0.12);
  const [tpH, setTpH] = useState(5);
  const [troubleData, setTroubleData] = useState<TroubleshootingEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('');
  const [filterModel, setFilterModel] = useState<string>('');
  const [hoveredWear, setHoveredWear] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch('/troubleshooting_db.json')
      .then(res => res.json())
      .then(json => setTroubleData(json.data || []))
      .catch(err => console.error('Error loading DB', err));
  }, []);

  // Calculations
  const currentAudit = useMemo(
    () => calculateAuditMetrics(wear, price, qty, tpH, 125, kwhRate),
    [wear, price, qty, tpH, kwhRate]
  );

  const auditData = useMemo(
    () => generateAuditCurve(price, qty, tpH, kwhRate),
    [price, qty, tpH, kwhRate]
  );

  const status = useMemo(() => getSystemStatus(wear), [wear]);

  // Extract unique values for filters
  const uniqueCategories = useMemo(() => 
    [...new Set(troubleData.map(d => d.category).filter(Boolean))], [troubleData]);
  const uniqueSeverities = useMemo(() => 
    [...new Set(troubleData.map(d => d.severity).filter(Boolean))], [troubleData]);
  const uniqueModels = useMemo(() => 
    [...new Set(troubleData.map(d => d.model).filter(Boolean))], [troubleData]);

  // Filtered troubleshooting with multi-criteria
  const filteredTrouble = useMemo(() => {
    let results = troubleData;
    
    // Filter by category
    if (filterCategory) {
      results = results.filter(item => item.category === filterCategory);
    }
    
    // Filter by severity
    if (filterSeverity) {
      results = results.filter(item => item.severity === filterSeverity);
    }
    
    // Filter by model
    if (filterModel) {
      results = results.filter(item => item.model === filterModel);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        item =>
          item.issue?.toLowerCase().includes(q) ||
          item.model?.toLowerCase().includes(q) ||
          item.technical_cause?.toLowerCase().includes(q) ||
          item.id?.toLowerCase().includes(q)
      );
    }
    
    return results;
  }, [troubleData, searchQuery, filterCategory, filterSeverity, filterModel]);

  // Chart hover sync
  const handleChartHover = useCallback((data: any) => {
    if (data?.activePayload?.[0]?.payload?.wearRaw !== undefined) {
      setHoveredWear(data.activePayload[0].payload.wearRaw);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-cyan-500 animate-pulse">Inicializando Sistema...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #0f172a;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
        
        input[type="range"] {
          -webkit-appearance: none;
          background: transparent;
        }
        input[type="range"]::-webkit-slider-track {
          height: 6px;
          background: linear-gradient(to right, #0f172a, #1e293b);
          border-radius: 3px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
          border: 2px solid #06b6d4;
          border-radius: 2px;
          cursor: pointer;
          margin-top: -6px;
          box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          background: linear-gradient(135deg, #475569 0%, #334155 100%);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
        }
      `}</style>

      <div className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-6">
        {/* Industrial Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard/projects"
                className="flex items-center justify-center w-10 h-10 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 rounded-lg transition-all group"
                title="Volver al menú principal"
              >
                <ArrowLeft className="text-slate-400 group-hover:text-cyan-400 transition-colors" size={20} />
              </Link>
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-2.5 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <CircuitBoard className="text-slate-950" size={24} />
              </div>
              <h1 className="text-2xl font-black tracking-tight">
                <span className="text-white">EAGLE</span>
                <span className="text-cyan-500 ml-2">OBSIDIAN</span>
              </h1>
            </div>
            <p className="text-slate-600 text-[10px] font-mono uppercase tracking-[0.25em] ml-[52px]">
              Industrial Performance Intelligence // Blade Audit System v2.0
            </p>
          </div>

          {/* System Status Indicator */}
          <div className={`flex items-center gap-4 px-5 py-3 rounded-xl border ${status.borderColor} ${status.bgColor} backdrop-blur-sm transition-all duration-500 ${status.glowColor}`}>
            <StatusLED status={status} />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Estado del Sistema</span>
              <span className={`text-sm font-black uppercase tracking-wide ${status.color}`}>{status.label}</span>
            </div>
            <div className="pl-4 border-l border-slate-700">
              <span className="text-[10px] text-slate-400 block max-w-[200px]">{status.message}</span>
            </div>
          </div>
        </header>

        {/* Main Grid - 12 columns */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Controls (4 cols) */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Blade Configuration */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-cyan-500/20" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                <Gauge size={14} className="text-cyan-500" /> Configuración de Cuchilla
              </h2>

              <div className="space-y-6">
                {/* Wear Slider */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Nivel de Desgaste</span>
                    <span className={`text-2xl font-black font-mono ${status.color} transition-colors`}>
                      {(wear * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={wear}
                    onChange={e => setWear(parseFloat(e.target.value))}
                    className="w-full h-1.5 cursor-pointer"
                  />
                  <div className="flex justify-between mt-2 font-mono text-[8px] text-slate-600 uppercase tracking-wider">
                    <span className="text-emerald-600">NUEVO</span>
                    <span className="text-cyan-600">ÓPTIMO</span>
                    <span className="text-amber-600">LÍMITE</span>
                    <span className="text-rose-600">FALLO</span>
                  </div>
                </div>

                {/* Price & Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Precio Unit ($)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={e => setPrice(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm font-mono text-white focus:border-cyan-500 outline-none transition-all hover:border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Cantidad</label>
                    <input
                      type="number"
                      value={qty}
                      onChange={e => setQty(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm font-mono text-white focus:border-cyan-500 outline-none transition-all hover:border-slate-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Energy & Production */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-amber-500/20" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                <Zap size={14} className="text-amber-500" /> Energía y Producción
              </h2>

              <div className="space-y-5">
                {/* kWh Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Tarifa kWh (USD)</label>
                    <span className="text-xs font-mono text-amber-500 font-bold">
                      <AnimatedValue value={kwhRate} prefix="$" decimals={2} />
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={kwhRate}
                    onChange={e => setKwhRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm font-mono text-white focus:border-amber-500 outline-none transition-all hover:border-slate-700"
                  />
                </div>

                {/* Productivity Slider */}
                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Rendimiento Base (Neum/hr)</label>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={tpH}
                    onChange={e => setTpH(parseInt(e.target.value))}
                    className="w-full h-1.5 cursor-pointer"
                    style={{ accentColor: '#f59e0b' }}
                  />
                  <div className="flex justify-between items-center bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Tasa Actual</span>
                    <span className="text-xl font-black font-mono text-white">
                      {tpH} <span className="text-[9px] text-slate-600 font-normal">UPH</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Knowledge Base - Enhanced */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 backdrop-blur-sm">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                <BookOpen size={14} className="text-cyan-500" /> Base de Conocimiento
              </h2>
              
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-3 text-slate-600" size={14} />
                <input
                  type="text"
                  placeholder="BUSCAR..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-[10px] font-bold tracking-widest outline-none focus:border-cyan-500 transition-all placeholder:text-slate-700 uppercase"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-wide outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="">Categoría</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={filterSeverity}
                  onChange={e => setFilterSeverity(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-wide outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="">Severidad</option>
                  {uniqueSeverities.map(sev => (
                    <option key={sev} value={sev}>{sev}</option>
                  ))}
                </select>
                <select
                  value={filterModel}
                  onChange={e => setFilterModel(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-wide outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="">Modelo</option>
                  {uniqueModels.map(mod => (
                    <option key={mod} value={mod}>{mod}</option>
                  ))}
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[9px] font-mono text-slate-600">
                  {filteredTrouble.length} resultado{filteredTrouble.length !== 1 ? 's' : ''}
                </span>
                {(filterCategory || filterSeverity || filterModel || searchQuery) && (
                  <button
                    onClick={() => {
                      setFilterCategory('');
                      setFilterSeverity('');
                      setFilterModel('');
                      setSearchQuery('');
                    }}
                    className="text-[9px] text-cyan-500 hover:text-cyan-400 font-bold uppercase"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Results List */}
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {filteredTrouble.length === 0 ? (
                  <div className="text-center py-6 text-slate-600 text-[10px]">
                    No se encontraron resultados
                  </div>
                ) : (
                  filteredTrouble.map(item => {
                    const severityStyle = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG['Media'];
                    const categoryInfo = CATEGORY_CONFIG[item.category] || { icon: '📋', color: 'text-slate-400' };
                    const isExpanded = expandedEntry === item.id;
                    
                    return (
                      <div
                        key={item.id}
                        onClick={() => setExpandedEntry(isExpanded ? null : item.id)}
                        className={`bg-slate-950/80 border rounded-lg p-3 transition-all cursor-pointer ${
                          isExpanded ? 'border-cyan-500/50' : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-sm mt-0.5">{categoryInfo.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[9px] font-mono text-cyan-500 font-bold">{item.id}</span>
                              <span className={`text-[8px] px-1.5 py-0.5 rounded border ${severityStyle.bg} ${severityStyle.border} ${severityStyle.color}`}>
                                {item.severity}
                              </span>
                              <span className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{item.model}</span>
                            </div>
                            <p className={`text-[10px] leading-relaxed ${isExpanded ? 'text-white' : 'text-slate-300'}`}>
                              {item.issue}
                            </p>
                            
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                                <div>
                                  <span className="text-[8px] font-bold text-slate-500 uppercase">Causa Técnica:</span>
                                  <p className="text-[10px] text-slate-400 mt-1">{item.technical_cause}</p>
                                </div>
                                <div>
                                  <span className="text-[8px] font-bold text-emerald-500 uppercase">Solución:</span>
                                  <p className="text-[10px] text-emerald-300/80 mt-1">{item.suggested_solution}</p>
                                </div>
                                <div className="text-[8px] text-slate-600 font-mono">
                                  📖 {item.reference}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          {/* Right Column: Analysis (8 cols) */}
          <section className="lg:col-span-8 space-y-5">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Productivity Loss */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-900/50 border border-slate-800 p-5 rounded-2xl relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-slate-500 text-[9px] font-black uppercase tracking-[0.15em] mb-2">Pérdida Productiva</div>
                <div className="text-3xl font-black text-white flex items-baseline gap-1">
                  <span className="text-rose-500 text-xl">$</span>
                  <AnimatedValue value={currentAudit.productivityLoss} prefix="" />
                </div>
                <TrendingDown className="absolute top-4 right-4 text-rose-500/15 group-hover:text-rose-500/30 transition-colors" size={36} />
              </div>

              {/* Energy Cost */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-900/50 border border-slate-800 p-5 rounded-2xl relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-slate-500 text-[9px] font-black uppercase tracking-[0.15em] mb-2">Energía por Unidad</div>
                <div className="text-3xl font-black text-white flex items-baseline gap-1">
                  <span className="text-amber-500 text-xl">$</span>
                  <AnimatedValue value={currentAudit.energyCostPerUnit} prefix="" decimals={2} />
                </div>
                <div className="text-[9px] text-slate-600 mt-1 font-mono">
                  Baseline: ${currentAudit.baselineEnergyCost}
                </div>
                <Zap className="absolute top-4 right-4 text-amber-500/15 group-hover:text-amber-500/30 transition-colors" size={36} />
              </div>

              {/* Stress Factor */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-900/50 border border-slate-800 p-5 rounded-2xl relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-slate-500 text-[9px] font-black uppercase tracking-[0.15em] mb-2">Factor de Stress</div>
                <div className="text-3xl font-black text-white flex items-baseline gap-1">
                  <span className="text-cyan-500 text-xl">×</span>
                  <AnimatedValue value={currentAudit.stressFactor} prefix="" decimals={2} />
                </div>
                <div className="text-[9px] text-slate-600 mt-1 font-mono">
                  Multiplicador hidráulico
                </div>
                <Thermometer className="absolute top-4 right-4 text-cyan-500/15 group-hover:text-cyan-500/30 transition-colors" size={36} />
              </div>
            </div>

            {/* Main Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white">Análisis de Correlación de Pérdida</h3>
                  <p className="text-[10px] text-slate-600 font-mono mt-1 uppercase">Simulación no lineal de desgaste térmico</p>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Impacto Económico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Costo Energía</span>
                  </div>
                </div>
              </div>

              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={auditData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    onMouseMove={handleChartHover}
                    onMouseLeave={() => setHoveredWear(null)}
                  >
                    <defs>
                      <linearGradient id="gradLoss" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradEnergy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="wear"
                      stroke="#475569"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                      fontFamily="monospace"
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#f43f5e"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={val => `$${val}`}
                      fontFamily="monospace"
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#06b6d4"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={val => `$${val}`}
                      fontFamily="monospace"
                    />
                    <Tooltip 
                      content={<CustomTooltip />} 
                      cursor={{ stroke: '#334155', strokeWidth: 1 }}
                      wrapperStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', outline: 'none' }}
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', color: '#e2e8f0' }}
                    />
                    {/* Current Wear Reference Line */}
                    <ReferenceLine
                      x={`${(wear * 100).toFixed(0)}%`}
                      yAxisId="left"
                      stroke={status.level === 'critical' ? '#f43f5e' : status.level === 'warning' ? '#f59e0b' : '#06b6d4'}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      label={{
                        value: 'ACTUAL',
                        position: 'top',
                        fill: '#64748b',
                        fontSize: 9,
                        fontWeight: 'bold'
                      }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="hiddenCost"
                      name="Impacto Total"
                      stroke="#f43f5e"
                      strokeWidth={3}
                      fill="url(#gradLoss)"
                      animationDuration={1200}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="energy"
                      name="Costo Energía"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      fill="url(#gradEnergy)"
                      animationDuration={1200}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldAlert size={140} className="text-cyan-500" />
              </div>
              <div className="relative z-10 space-y-2">
                <span className="text-cyan-500 font-black text-[9px] uppercase tracking-[0.3em]">Resumen de Auditoría</span>
                <h4 className="text-white text-2xl lg:text-3xl font-black uppercase tracking-tight">Pérdida Total Estimada / Ciclo</h4>
                <p className="text-slate-500 text-[11px] font-mono max-w-lg leading-relaxed">
                  Impacto financiero acumulado considerando degradación de HP, resistencia hidráulica y pérdida de unidades por hora procesadas.
                </p>
              </div>
              <div className="relative z-10 text-center md:text-right">
                <div className="text-5xl lg:text-6xl font-black text-white tracking-tighter flex items-center justify-center md:justify-end">
                  <span className="text-cyan-500 text-2xl lg:text-3xl font-bold mr-1">$</span>
                  <AnimatedValue value={currentAudit.totalHiddenCost} prefix="" />
                </div>
                <button 
                  onClick={() => {
                    const report = {
                      fecha: new Date().toISOString(),
                      desgaste: `${(wear * 100).toFixed(0)}%`,
                      estado: status.label,
                      perdidaProductiva: currentAudit.productivityLoss,
                      energiaPorUnidad: currentAudit.energyCostPerUnit,
                      factorStress: currentAudit.stressFactor,
                      perdidaTotal: currentAudit.totalHiddenCost,
                      parametros: { precioCuchilla: price, cantidad: qty, tarifaKwh: kwhRate, rendimientoBase: tpH }
                    };
                    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `eagle-audit-report-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="mt-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto md:ml-auto shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                  <Download size={14} />
                  Exportar Reporte
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="pt-8 pb-6 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-700 font-mono text-[9px] uppercase tracking-[0.2em]">
          <div className="flex gap-8">
            <span>Eagle International Group</span>
            <span className="text-slate-800">|</span>
            <span>Auth Code: 0x8829-TP2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span>Sistema Operacional</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
