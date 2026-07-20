
import React, { useState, useMemo, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Calculator, TrendingDown, AlertTriangle, DollarSign, 
  Activity, BookOpen, Search, Zap, Gauge, ArrowRight, ShieldAlert 
} from 'lucide-react';

interface HiddenCostResult {
  productivityLoss: number;
  maintenanceLiability: number;
  stressFactor: number;
  totalHiddenCost: number;
  energyCostPerUnit: number;
}

interface TroubleshootingEntry {
  id: string;
  model: string;
  issue: string;
  technical_cause: string;
  suggested_solution: string;
  reference: string;
}

// Lógica de Auditoría con rigor industrial
export const calculateAuditMetrics = (
  bladeWear: number,
  unitPrice: number,
  qty: number,
  baseProductivity: number,
  hp: number,
  kwhPrice: number
): HiddenCostResult => {
  const productivityDropCoeff = bladeWear < 0.4 ? 0.05 * bladeWear : Math.pow(bladeWear, 2.8); // Mayor penalización no lineal
  const currentProductivity = Math.max(1, baseProductivity * (1 - (productivityDropCoeff * 0.6)));
  const productivityLoss = baseProductivity * productivityDropCoeff * 160; 

  const stressFactor = bladeWear > 0.65 ? Math.exp(bladeWear * 3.2) / 10 : 1 + (bladeWear * 0.4);
  const maintenanceLiability = (unitPrice * qty) * (Math.pow(bladeWear, 2.2));

  const kwConsumption = (hp * 0.7457) / 0.88; // Eficiencia real de motor industrial
  const hourlyEnergyCost = kwConsumption * kwhPrice;
  const energyCostPerUnit = hourlyEnergyCost / currentProductivity;

  const totalHiddenCost = productivityLoss + (maintenanceLiability * stressFactor);

  return {
    productivityLoss: Math.round(productivityLoss),
    maintenanceLiability: Math.round(maintenanceLiability),
    stressFactor: parseFloat(stressFactor.toFixed(2)),
    totalHiddenCost: Math.round(totalHiddenCost),
    energyCostPerUnit: parseFloat(energyCostPerUnit.toFixed(2))
  };
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-slate-500 text-[10px] font-bold uppercase mb-2 tracking-widest">{`Desgaste: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between gap-8 items-center mb-1">
            <span className="text-xs text-slate-300" style={{ color: entry.color }}>{entry.name}:</span>
            <span className="text-sm font-mono font-bold text-white">${entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const App: React.FC = () => {
  const [wear, setWear] = useState<number>(0.25);
  const [price, setPrice] = useState<number>(607.23);
  const [qty, setQty] = useState<number>(2);
  const [kwhRate, setKwhRate] = useState<number>(0.12);
  const [tpH, setTpH] = useState<number>(5);
  const [troubleData, setTroubleData] = useState<TroubleshootingEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch('/troubleshooting_db.json')
      .then(res => res.json())
      .then(json => setTroubleData(json.data))
      .catch(err => console.error("Error loading DB", err));
  }, []);

  const currentAudit = useMemo(() => 
    calculateAuditMetrics(wear, price, qty, tpH, 125, kwhRate), 
  [wear, price, qty, tpH, kwhRate]);

  const auditData = useMemo(() => {
    return Array.from({length: 21}, (_, i) => {
      const w = i / 20;
      const calc = calculateAuditMetrics(w, price, qty, tpH, 125, kwhRate);
      return {
        wear: `${(w * 100).toFixed(0)}%`,
        hiddenCost: calc.totalHiddenCost,
        energy: calc.energyCostPerUnit
      };
    });
  }, [price, qty, tpH, kwhRate]);

  const statusInfo = useMemo(() => {
    if (wear > 0.7) return { label: "Crítico", color: "text-rose-500", border: "border-rose-500/30", bg: "bg-rose-500/10", icon: <ShieldAlert size={18} /> };
    if (wear > 0.4) return { label: "Advertencia", color: "text-amber-500", border: "border-amber-500/30", bg: "bg-amber-500/10", icon: <AlertTriangle size={18} /> };
    return { label: "Nominal", color: "text-cyan-500", border: "border-cyan-500/30", bg: "bg-cyan-500/10", icon: <Activity size={18} /> };
  }, [wear]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-6">
        
        {/* Header Superior Industrial */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-500 p-2 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                <Activity className="text-slate-950" size={24} />
              </div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                Eagle <span className="text-cyan-500 italic-none">Auditor v2.0</span>
              </h1>
            </div>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-[0.2em]">Industrial Performance Intelligence // Chile ST Node</p>
          </div>

          <div className={`flex items-center gap-4 px-4 py-2 rounded-xl border ${statusInfo.border} ${statusInfo.bg} transition-all duration-500`}>
            <div className={statusInfo.color}>{statusInfo.icon}</div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase text-slate-500 leading-none">Status</span>
              <span className={`text-sm font-black uppercase ${statusInfo.color}`}>{statusInfo.label}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Columna Izquierda: Controladores */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Blade Configuration Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50"></div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <Gauge size={14} className="text-cyan-500" /> Configuración de Cuchilla
              </h2>
              
              <div className="space-y-8">
                <div className="relative">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-xs font-bold text-slate-300 uppercase">Nivel de Desgaste</span>
                    <span className={`text-2xl font-black font-mono ${statusInfo.color}`}>{(wear * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.01" value={wear}
                    onChange={(e) => setWear(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between mt-2 font-mono text-[9px] text-slate-600 uppercase">
                    <span>New</span>
                    <span>Optim</span>
                    <span>Limit</span>
                    <span>Fail</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Precio Unit ($)</label>
                    <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm font-mono text-white focus:border-cyan-500 outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Cant. Cuchillas</label>
                    <input type="number" value={qty} onChange={e => setQty(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm font-mono text-white focus:border-cyan-500 outline-none transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            {/* Energy & Productivity Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50"></div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <Zap size={14} className="text-amber-500" /> Energía y Producción
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Tarifa kWh (USD)</label>
                    <span className="text-xs font-mono text-amber-500 font-bold">${kwhRate}</span>
                  </div>
                  <input type="number" step="0.01" value={kwhRate} onChange={e => setKwhRate(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm font-mono text-white focus:border-amber-500 outline-none transition-colors" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Rendimiento (Neumáticos/hr)</label>
                  <input 
                    type="range" min="1" max="15" step="1" value={tpH}
                    onChange={(e) => setTpH(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Tasa Actual</span>
                    <span className="text-xl font-black font-mono text-white">{tpH} <span className="text-[10px] text-slate-500 font-normal">UPH</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Manual Quick Search */}
            <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-600" size={14} />
                <input 
                  type="text" placeholder="BUSCAR EN MANUALES TÉCNICOS..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-[10px] font-bold tracking-widest outline-none focus:border-cyan-500 transition-all placeholder:text-slate-700 uppercase"
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </aside>

          {/* Columna Derecha: Análisis y Gráficos */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative group">
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Pérdida Productiva</div>
                <div className="text-3xl font-black text-white flex items-end gap-1">
                  <span className="text-rose-500">$</span>
                  {currentAudit.productivityLoss.toLocaleString()}
                </div>
                <TrendingDown className="absolute top-4 right-4 text-rose-500/20 group-hover:text-rose-500/40 transition-colors" size={40} />
              </div>
              
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative group">
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Energía por Unidad</div>
                <div className="text-3xl font-black text-white flex items-end gap-1">
                  <span className="text-amber-500">$</span>
                  {currentAudit.energyCostPerUnit}
                </div>
                <Zap className="absolute top-4 right-4 text-amber-500/20 group-hover:text-amber-500/40 transition-colors" size={40} />
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative group">
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Stress Factor</div>
                <div className="text-3xl font-black text-white flex items-end gap-1">
                  <span className="text-cyan-500">x</span>
                  {currentAudit.stressFactor}
                </div>
                <Activity className="absolute top-4 right-4 text-cyan-500/20 group-hover:text-cyan-500/40 transition-colors" size={40} />
              </div>
            </div>

            {/* Chart Area */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Análisis de Correlación de Pérdida</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">SIMULACIÓN NO LINEAL DE DESGASTE TÉRMICO</p>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-rose-500 rounded-full"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Impacto Económico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-cyan-500 rounded-full"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Costo Energía</span>
                  </div>
                </div>
              </div>
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={auditData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradLoss" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gradEnergy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="wear" 
                      stroke="#475569" 
                      fontSize={10} 
                      axisLine={false} 
                      tickLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      yAxisId="left" 
                      stroke="#f43f5e" 
                      fontSize={10} 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(val) => `$${val}`}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      stroke="#06b6d4" 
                      fontSize={10} 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />
                    <Area 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="hiddenCost" 
                      name="Impacto Total" 
                      stroke="#f43f5e" 
                      strokeWidth={3} 
                      fill="url(#gradLoss)" 
                      animationDuration={1500}
                    />
                    <Area 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="energy" 
                      name="Costo Energía" 
                      stroke="#06b6d4" 
                      strokeWidth={3} 
                      fill="url(#gradEnergy)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Resumen Final Auditado */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2">
                <ShieldAlert className="text-slate-700 group-hover:text-cyan-500/20 transition-colors" size={120} />
              </div>
              <div className="relative z-10 space-y-2">
                <span className="text-cyan-500 font-black text-[10px] uppercase tracking-[0.4em]">Resumen de Auditoría</span>
                <h4 className="text-white text-3xl font-black uppercase tracking-tighter">Pérdida Total Estimada / Ciclo</h4>
                <p className="text-slate-500 text-xs font-mono max-w-md">Impacto financiero acumulado considerando degradación de HP, resistencia hidráulica y pérdida de unidades por hora procesadas.</p>
              </div>
              <div className="relative z-10 text-center md:text-right">
                <div className="text-6xl font-black text-white tracking-tighter flex items-center justify-center md:justify-end gap-2">
                  <span className="text-cyan-500 text-2xl font-bold leading-none">$</span>
                  {currentAudit.totalHiddenCost.toLocaleString()}
                </div>
                <button className="mt-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto md:ml-auto">
                  Exportar Reporte <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </section>
        </main>

        <footer className="pt-12 pb-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-600 font-mono text-[9px] uppercase tracking-widest">
          <div className="flex gap-8">
            <span>Eagle International Group</span>
            <span>Auth Code: 0x8829-TP2</span>
          </div>
          <div className="text-slate-700">
            &copy; 2024 Industrial Intelligent Systems - Todos los derechos reservados
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
