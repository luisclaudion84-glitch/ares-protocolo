// app/components/NutritionTracker.tsx
import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Utensils, X } from 'lucide-react';
import { TACO_DATABASE, type FoodItem } from '../data/foodDatabase';
import { loadProfile } from '../lib/profileStorage';
import { getDietSuggestions } from '~/lib/dietSuggestions';
import { ChefHat, ChevronDown, ChevronUp } from 'lucide-react'; // Ícones novos

interface LogEntry extends FoodItem {
  instanceId: string;
  amount: number;
}

export default function NutritionTracker({ currentTheme }: { currentTheme: any }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [amount, setAmount] = useState<number>(100);
  const [showManual, setShowManual] = useState(false);

  // Estados para o formulário manual
  const [mName, setMName] = useState('');
  const [mKcal, setMKcal] = useState('');
  const [mProt, setMProt] = useState('');
  const [mCarb, setMCarb] = useState('');
  const [mGord, setMGord] = useState('');

  // Metas vindas do Perfil salvo
  const savedProfile = loadProfile();
  const targetCalories = savedProfile?.targetCalories || 0;
  const targetProtein = savedProfile?.targetProtein || 0;
  const targetCarbs = savedProfile?.targetCarbs || 0;
  const targetFat = savedProfile?.targetFat || 0;
  const [showGuide, setShowGuide] = useState(false);
  const suggestions = getDietSuggestions(savedProfile?.goal || 'maintenance', targetCalories);

  const filteredFoods = useMemo(() => {
    if (!searchTerm) return [];
    return TACO_DATABASE.filter(food => 
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [searchTerm]);

  const addFood = (food: FoodItem) => {
    setLogs([{ ...food, instanceId: crypto.randomUUID(), amount }, ...logs]);
    setSearchTerm('');
  };

  const addManualFood = () => {
    if (!mName || !mKcal) return;
    const food: FoodItem = {
      id: 'manual-' + Date.now(),
      category: 'Personalizado',
      name: mName,
      calories: Number(mKcal),
      protein: Number(mProt) || 0,
      carbs: Number(mCarb) || 0,
      fat: Number(mGord) || 0
    };
    addFood(food);
    setShowManual(false);
    setMName(''); setMKcal(''); setMProt(''); setMCarb(''); setMGord('');
  };

  const removeLog = (id: string) => setLogs(logs.filter(log => log.instanceId !== id));

  const totals = logs.reduce((acc, log) => {
    const factor = log.amount / 100;
    return {
      kcal: acc.kcal + (log.calories * factor),
      protein: acc.protein + (log.protein * factor),
      carbs: acc.carbs + (log.carbs * factor),
      fat: acc.fat + (log.fat * factor),
    };
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto p-4">
      
      {/* 📊 RESUMO NUTRICIONAL */}
      <div className={`p-6 rounded-3xl border-2 shadow-2xl backdrop-blur-sm ${currentTheme.border} bg-black/10`}>
        <div className="flex items-center gap-2 mb-6">
          <Utensils className="text-emerald-500" size={24} />
          <h3 className={`text-xl font-black uppercase tracking-tighter ${currentTheme.text}`}>Resumo Nutricional</h3>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Kcal', val: `${totals.kcal.toFixed(0)} / ${targetCalories.toFixed(0)}`, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Prot', val: `${totals.protein.toFixed(1)} / ${targetProtein}g`, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'Carb', val: `${totals.carbs.toFixed(1)} / ${targetCarbs}g`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Gord', val: `${totals.fat.toFixed(1)} / ${targetFat}g`, color: 'text-amber-400', bg: 'bg-amber-500/10' }
          ].map((item, i) => (
            <div key={i} className={`p-4 rounded-2xl border ${currentTheme.border} ${item.bg}`}>
              <p className={`text-[10px] font-black uppercase mb-1 ${item.color}`}>{item.label}</p>
              <p className={`text-xl font-black ${currentTheme.text}`}>{item.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🎖️ PROTOCOLO NUTRICIONAL SUGERIDO */}
<div className={`rounded-3xl border-2 transition-all ${currentTheme.border} ${showGuide ? 'bg-emerald-500/5' : 'bg-black/5'}`}>
  <button 
    onClick={() => setShowGuide(!showGuide)}
    className="w-full p-5 flex items-center justify-between outline-none"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-emerald-500/20 rounded-xl">
        <ChefHat className="text-emerald-500" size={20} />
      </div>
      <div className="text-left">
        <h3 className={`font-black uppercase italic tracking-tighter ${currentTheme.text}`}>Sugestão de Protocolo</h3>
        <p className="text-[10px] text-gray-500 font-bold uppercase">Baseado no seu objetivo de {savedProfile?.goal === 'loss' ? 'Perder Gordura' : savedProfile?.goal === 'gain' ? 'Ganhar Massa' : 'Manutenção'}</p>
      </div>
    </div>
    {showGuide ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
  </button>

  {showGuide && (
    <div className="px-5 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
      {suggestions.map((meal, idx) => (
        <div key={idx} className="p-4 rounded-2xl bg-black/20 border border-white/5">
          <p className="text-[10px] font-black text-emerald-500 uppercase mb-2 tracking-widest">{meal.name}</p>
          <ul className="space-y-1">
            {meal.items.map((item, i) => (
              <li key={i} className={`text-sm font-medium ${currentTheme.text} flex items-center gap-2`}>
                <div className="w-1 h-1 bg-emerald-500 rounded-full" /> {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="col-span-full mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
        <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest italic">
          ⚠️ Isso é uma sugestão teórica. Consulte um nutricionista para um plano individualizado.
        </p>
      </div>
    </div>
  )}
</div>

      {/* 🔍 BUSCADOR + BOTÃO MANUAL */}
      <div className="flex flex-col gap-3">
        <div className="relative group flex-1">
          <div className={`flex items-center rounded-2xl border-2 p-2 transition-all bg-black/20 ${currentTheme.border} focus-within:border-emerald-500`}>
            <Search className="ml-3 text-gray-500" size={20} />
            <input 
              type="text"
              placeholder="Pesquisar no Protocolo ARES..."
              className={`w-full p-3 bg-transparent outline-none font-medium ${currentTheme.text}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex items-center gap-2 px-3 border-l border-gray-800">
              <input type="number" className={`w-14 bg-transparent text-center font-black ${currentTheme.text}`} value={amount} onChange={(e)=>setAmount(Number(e.target.value))} />
              <span className="text-[10px] font-bold text-gray-500">G</span>
            </div>
          </div>

          {/* LISTA RESULTADOS */}
          {filteredFoods.length > 0 && (
            <div className={`absolute top-full left-0 right-0 mt-3 rounded-2xl border-2 shadow-2xl z-50 overflow-hidden backdrop-blur-md bg-gray-900/95 ${currentTheme.border}`}>
              {filteredFoods.map(food => (
                <button key={food.id} onClick={() => addFood(food)} className={`w-full flex justify-between p-5 hover:bg-emerald-500/10 border-b last:border-0 ${currentTheme.border}`}>
                  <div>
                    <p className="font-bold text-white text-lg">{food.name}</p>
                    <p className="text-[11px] text-gray-400 font-bold uppercase">{food.calories}kcal • P:{food.protein}g C:{food.carbs}g G:{food.fat}g</p>
                  </div>
                  <Plus className="text-emerald-500" />
                </button>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={() => setShowManual(true)}
          className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed ${currentTheme.border} ${currentTheme.text} hover:bg-white/5 transition-all text-sm font-bold`}
        >
          <Plus size={18} /> Adicionar Alimento Personalizado
        </button>
      </div>

      {/* 📝 MODAL / FORMULÁRIO MANUAL */}
      {showManual && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-3xl border-2 shadow-2xl bg-gray-900 ${currentTheme.border}`}>
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-white font-black uppercase italic text-xl">Novo Alimento</h4>
              <button onClick={() => setShowManual(false)} className="text-gray-500 hover:text-white"><X /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Nome do Alimento" className={`w-full p-4 rounded-xl bg-black/40 border ${currentTheme.border} text-white outline-none focus:border-emerald-500`} value={mName} onChange={e=>setMName(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Kcal" className={`p-4 rounded-xl bg-black/40 border ${currentTheme.border} text-white outline-none`} value={mKcal} onChange={e=>setMKcal(e.target.value)} />
                <input type="number" placeholder="Prot (g)" className={`p-4 rounded-xl bg-black/40 border ${currentTheme.border} text-white outline-none`} value={mProt} onChange={e=>setMProt(e.target.value)} />
                <input type="number" placeholder="Carb (g)" className={`p-4 rounded-xl bg-black/40 border ${currentTheme.border} text-white outline-none`} value={mCarb} onChange={e=>setMCarb(e.target.value)} />
                <input type="number" placeholder="Gord (g)" className={`p-4 rounded-xl bg-black/40 border ${currentTheme.border} text-white outline-none`} value={mGord} onChange={e=>setMGord(e.target.value)} />
              </div>
              <button onClick={addManualFood} className="w-full p-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest mt-4">Salvar Alimento</button>
            </div>
          </div>
        </div>
      )}

      {/* 📜 HISTÓRICO */}
      <div className="space-y-3">
        {logs.map(log => {
          const factor = log.amount / 100;
          return (
            <div key={log.instanceId} className={`flex items-center justify-between p-5 rounded-2xl border bg-black/10 ${currentTheme.border}`}>
              <div>
                <p className={`font-bold text-lg ${currentTheme.text}`}>{log.name}</p>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{log.amount}g</p>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="font-black text-emerald-500 text-xl">{(log.calories * factor).toFixed(0)} <span className="text-[10px] uppercase">kcal</span></p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">P:{(log.protein * factor).toFixed(1)}g | C:{(log.carbs * factor).toFixed(1)}g</p>
                </div>
                <button onClick={() => removeLog(log.instanceId)} className="p-3 text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}