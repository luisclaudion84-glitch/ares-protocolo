import { useState } from 'react';
import { Droplets, CloudSun, Dumbbell, Zap } from 'lucide-react';
import { generateFullProtocol } from '../lib/protocolEngine';
import { loadProfile } from '../lib/profileStorage';
import { supabase } from '../lib/supabase';

export function WaterTracker({ currentTheme }: { currentTheme: any }) {
  // 1. Estados
  const [adjustments, setAdjustments] = useState({ workout: false, creatine: false, heat: false });
  const [logs, setLogs] = useState<{ amount: number }[]>([]);
  const [showCustomWaterInput, setShowCustomWaterInput] = useState(false);
  const [customWaterAmount, setCustomWaterAmount] = useState('');

  // 2. Motor Ares
  const profile = loadProfile();
  const protocol = profile ? generateFullProtocol(profile, adjustments) : null;
  
  const totalConsumed = logs.reduce((acc, log) => acc + log.amount, 0);
  const fixedGoal = protocol?.hydration.fixedDailyGoal || 2500;
  const extraTotal = protocol?.hydration.recommendedExtra || 0;
  
  const progress = Math.min((totalConsumed / fixedGoal) * 100, 100);

  // 3. Ações
  async function addWater(amount: number) {
    setLogs(prev => [{ amount }, ...prev]);
    try {
      await supabase.from('water_logs').insert([{ amount }]);
    } catch (e) {
      console.warn("Salvando apenas localmente.");
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-10">
      
      {/* CARD DE PROGRESSO */}
      <div className={`rounded-3xl p-6 border shadow-xl ${currentTheme.card} ${currentTheme.border}`}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className={`text-3xl font-black italic uppercase tracking-tighter ${currentTheme.text}`}>Hidratação</h2>
            <p className={`text-xs font-bold ${currentTheme.subtext}`}>META DO PROTOCOLO: {fixedGoal}ml</p>
          </div>
          <Droplets className="text-blue-500" size={32} />
        </div>

        <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden border border-white/5">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="mt-4 flex justify-between items-end">
          <div>
            <p className="text-4xl font-black text-blue-400">{totalConsumed}<span className="text-sm ml-1 text-slate-500">/ {fixedGoal}ml</span></p>
            {extraTotal > 0 && <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">+ {extraTotal}ml Recomendado (Clima/Treino)</p>}
          </div>
          <div className="text-right">
             <p className={`text-xs font-bold ${currentTheme.subtext}`}>FALTAM</p>
             <p className="text-xl font-black text-white">{Math.max(0, fixedGoal - totalConsumed)}ml</p>
          </div>
        </div>
      </div>

      {/* BOTÕES DE CONSUMO RÁPIDO */}
      <div className="grid grid-cols-4 gap-3">
        {[200, 300, 500].map(val => (
          <button 
            key={val} 
            onClick={() => addWater(val)}
            className={`py-4 rounded-2xl border font-black transition-all hover:scale-105 active:scale-95 ${currentTheme.card} ${currentTheme.border} ${currentTheme.text}`}
          >
            +{val}<span className="text-[10px] block opacity-50 font-normal">ml</span>
          </button>
        ))}
        <button 
          onClick={() => setShowCustomWaterInput(true)}
          className={`py-4 rounded-2xl border border-dashed border-slate-600 text-slate-400 font-bold text-xs hover:border-blue-500 hover:text-blue-400 transition-all ${currentTheme.card}`}
        >
          OUTRO
        </button>
      </div>

      {/* MODAL CONSUMO PERSONALIZADO */}
      {showCustomWaterInput && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] px-6">
          <div className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl ${currentTheme.card} ${currentTheme.border}`}>
            <h3 className={`text-lg font-black uppercase tracking-tight mb-4 ${currentTheme.text}`}>Personalizada</h3>
            <div className="flex items-center gap-3 mb-6">
              <input
                type="number"
                value={customWaterAmount}
                onChange={e => setCustomWaterAmount(e.target.value)}
                className={`flex-1 bg-black/30 border border-slate-700 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:border-blue-500 ${currentTheme.text}`}
                autoFocus
              />
              <span className={`text-sm font-bold ${currentTheme.subtext}`}>ml</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowCustomWaterInput(false)} className="py-3 rounded-xl border border-slate-700 text-slate-400 font-bold">Cancelar</button>
              <button 
                onClick={() => {
                  const val = parseInt(customWaterAmount);
                  if (val > 0) { addWater(val); setShowCustomWaterInput(false); setCustomWaterAmount(''); }
                }}
                className="py-3 rounded-xl bg-blue-600 text-white font-black"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AJUSTES DO DIA (SUGESTÕES) */}
      <div className="grid grid-cols-3 gap-2">
        <button 
          onClick={() => setAdjustments(p => ({...p, workout: !p.workout}))}
          className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${adjustments.workout ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-slate-800 text-slate-500 grayscale'}`}
        >
          <Dumbbell size={16} />
          <span className="text-[9px] font-black uppercase">Treino</span>
        </button>
        <button 
          onClick={() => setAdjustments(p => ({...p, heat: !p.heat}))}
          className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${adjustments.heat ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'border-slate-800 text-slate-500 grayscale'}`}
        >
          <CloudSun size={16} />
          <span className="text-[9px] font-black uppercase">Calor</span>
        </button>
        <button 
          onClick={() => setAdjustments(p => ({...p, creatine: !p.creatine}))}
          className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${adjustments.creatine ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'border-slate-800 text-slate-500 grayscale'}`}
        >
          <Zap size={16} />
          <span className="text-[9px] font-black uppercase">Creatina</span>
        </button>
      </div>

      {/* CRONOGRAMA ESTRATÉGICO */}
      <div className={`rounded-3xl p-6 border ${currentTheme.card} ${currentTheme.border}`}>
        <p className={`text-xs font-black uppercase tracking-widest mb-4 ${currentTheme.subtext}`}>Plano de Batalha (Sugestões)</p>
        <div className="space-y-3">
          {protocol?.hydration.schedule.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-blue-400">{item.time}</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${item.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}>
                  {item.label}
                </span>
              </div>
              <span className="text-sm font-black text-white">{item.amount}ml</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}