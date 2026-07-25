// app/components/NutritionTracker.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Trash2, Utensils, X, CheckCircle } from 'lucide-react';
import { ChefHat, ChevronDown, ChevronUp } from 'lucide-react';
import { TACO_DATABASE, type FoodItem } from '../data/foodDatabase';
import { loadProfile } from '../lib/profileStorage';
import { getDietSuggestions } from '~/lib/dietSuggestions';
import { supabase } from '../lib/supabase';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

interface FoodItemExtended extends FoodItem {
  unit_type: 'g' | 'un';
  unit_weight?: number;
  isCustom?: boolean;
}

interface LogEntry extends FoodItemExtended {
  instanceId: string;
  dbId?: string;
  amount: number;
}

// ─── MAPEAMENTO DE UNIDADES ───────────────────────────────────────────────────

const UNIT_FOODS: Record<string, { unit_weight: number }> = {
  'ovo': { unit_weight: 50 },
  'banana': { unit_weight: 100 },
  'maçã': { unit_weight: 130 },
  'maca': { unit_weight: 130 },
  'laranja': { unit_weight: 150 },
  'barra de cereal': { unit_weight: 35 },
  'pão de forma': { unit_weight: 25 },
  'fatia de pão': { unit_weight: 25 },
  'pao de forma': { unit_weight: 25 },
  'tangerina': { unit_weight: 90 },
  'kiwi': { unit_weight: 70 },
  'pera': { unit_weight: 150 },
};

function enrichFood(food: FoodItem, overrideUnitType?: 'g' | 'un'): FoodItemExtended {
  const key = Object.keys(UNIT_FOODS).find(k =>
    food.name.toLowerCase().includes(k)
  );
  if (key) {
    return {
      ...food,
      unit_type: overrideUnitType || 'un',
      unit_weight: UNIT_FOODS[key].unit_weight,
    };
  }
  return { ...food, unit_type: overrideUnitType || 'g' };
}

function effectiveGrams(food: FoodItemExtended, qty: number): number {
  if (food.unit_type === 'un' && food.unit_weight) return qty * food.unit_weight;
  return qty;
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function NutritionTracker({ currentTheme }: { currentTheme: any }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showManual, setShowManual] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customFoods, setCustomFoods] = useState<FoodItemExtended[]>([]);

  // Alimento selecionado para adicionar
  const [selectedFood, setSelectedFood] = useState<FoodItemExtended | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(1);

  // Formulário manual
  const [mName, setMName] = useState('');
  const [mKcal, setMKcal] = useState('');
  const [mProt, setMProt] = useState('');
  const [mCarb, setMCarb] = useState('');
  const [mGord, setMGord] = useState('');
  const [mUnitType, setMUnitType] = useState<'g' | 'un'>('g');
  const [mUnitWeight, setMUnitWeight] = useState('');

  // Perfil e metas
  const savedProfile = loadProfile();
  const targetCalories = savedProfile?.targetCalories || 0;
  const targetProtein = savedProfile?.targetProtein || 0;
  const targetCarbs = savedProfile?.targetCarbs || 0;
  const targetFat = savedProfile?.targetFat || 0;
  const suggestions = getDietSuggestions(savedProfile?.goal || 'maintenance', targetCalories);

  // ─── CARREGAR REGISTROS DO DIA + ALIMENTOS PERSONALIZADOS ─────────────────

  useEffect(() => {
    async function load() {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Registros do dia
      const { data: logsData } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('logged_on', today)
        .order('created_at', { ascending: false });

      if (logsData) {
        setLogs(logsData.map((row: any) => ({
          instanceId: row.id,
          dbId: row.id,
          id: row.id,
          name: row.food_name,
          category: row.category || 'Personalizado',
          calories: row.calories_per_unit ?? row.calories,
          protein: row.protein_per_unit ?? row.protein,
          carbs: row.carbs_per_unit ?? row.carbs,
          fat: row.fat_per_unit ?? row.fat,
          unit_type: row.unit_type || 'g',
          unit_weight: row.unit_weight || undefined,
          amount: row.serving_size,
          isCustom: row.is_custom || false,
        })));
      }

      // Alimentos personalizados salvos
      const { data: customData } = await supabase
        .from('custom_foods')
        .select('*')
        .order('created_at', { ascending: false });

      if (customData) {
        setCustomFoods(customData.map((row: any) => ({
          id: row.id,
          name: row.food_name,
          category: 'Personalizado',
          calories: row.calories,
          protein: row.protein,
          carbs: row.carbs,
          fat: row.fat,
          unit_type: row.unit_type || 'g',
          unit_weight: row.unit_weight || undefined,
          isCustom: true,
        })));
      }

      setLoading(false);
    }
    load();
  }, []);

  // ─── BUSCA (TACO + PERSONALIZADOS) ───────────────────────────────────────

  const filteredFoods = useMemo(() => {
    if (!searchTerm) return [];
    const tacoResults = TACO_DATABASE
      .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 4)
      .map(f => enrichFood(f));

    const customResults = customFoods
      .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 2);

    const tacoWithPrefix = tacoResults.map(f => ({ ...f, id: `taco-${f.id}` }));
    const customWithPrefix = customResults.map(f => ({ ...f, id: `custom-${f.id}` }));
    return [...customWithPrefix, ...tacoWithPrefix];
  }, [searchTerm, customFoods]);

  // ─── SELECIONAR ALIMENTO ──────────────────────────────────────────────────

  function selectFood(food: FoodItemExtended) {
    setSelectedFood(food);
    setSelectedAmount(food.unit_type === 'un' ? 1 : 100);
    setSearchTerm('');
  }

  // ─── PREVIEW DE MACROS ────────────────────────────────────────────────────

  const preview = useMemo(() => {
    if (!selectedFood) return null;
    const grams = effectiveGrams(selectedFood, selectedAmount);
    const factor = grams / 100;
    return {
      kcal: (selectedFood.calories * factor).toFixed(0),
      protein: (selectedFood.protein * factor).toFixed(1),
      carbs: (selectedFood.carbs * factor).toFixed(1),
      fat: (selectedFood.fat * factor).toFixed(1),
      grams,
    };
  }, [selectedFood, selectedAmount]);

  // ─── CONFIRMAR ADIÇÃO ─────────────────────────────────────────────────────

  async function confirmAdd() {
  if (!selectedFood || !preview) return;
  const today = new Date().toISOString().split('T')[0];

  const entry: LogEntry = {
    ...selectedFood,
    instanceId: crypto.randomUUID(),
    amount: selectedAmount,
  };

  setLogs(prev => [entry, ...prev]);
  setSelectedFood(null);

  const payload = {
    food_name: selectedFood.name,
    calories: Number(preview.kcal),
    protein: Number(preview.protein),
    carbs: Number(preview.carbs),
    fat: Number(preview.fat),
    serving_size: selectedAmount,
    unit_type: selectedFood.unit_type,
    unit_weight: selectedFood.unit_weight || null,
    logged_on: today,
  };

  console.log('Enviando para Supabase:', payload);

  const { data, error } = await supabase
    .from('nutrition_logs')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Erro Supabase:', error.message, error.details, error.hint);
  } else {
    console.log('Salvo com sucesso:', data);
    setLogs(prev =>
      prev.map(l => l.instanceId === entry.instanceId ? { ...l, dbId: data.id } : l)
    );
  }
}

  // ─── ADICIONAR MANUAL ─────────────────────────────────────────────────────

  async function addManualFood() {
    if (!mName || !mKcal) return;

    const food: FoodItemExtended = {
      id: 'manual-' + Date.now(),
      category: 'Personalizado',
      name: mName,
      calories: Number(mKcal),
      protein: Number(mProt) || 0,
      carbs: Number(mCarb) || 0,
      fat: Number(mGord) || 0,
      unit_type: mUnitType,
      unit_weight: mUnitType === 'un' ? Number(mUnitWeight) || undefined : undefined,
      isCustom: true,
    };

    // Salva no banco de alimentos personalizados
    await supabase.from('custom_foods').insert([{
      food_name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      unit_type: food.unit_type,
      unit_weight: food.unit_weight || null,
    }]);

    setCustomFoods(prev => [food, ...prev]);
    setSelectedFood(food);
    setSelectedAmount(food.unit_type === 'un' ? 1 : 100);
    setShowManual(false);
    setMName(''); setMKcal(''); setMProt(''); setMCarb(''); setMGord('');
    setMUnitType('g'); setMUnitWeight('');
  }

  // ─── REMOVER LOG ──────────────────────────────────────────────────────────

  async function removeLog(log: LogEntry) {
    setLogs(prev => prev.filter(l => l.instanceId !== log.instanceId));
    if (log.dbId) {
      await supabase.from('nutrition_logs').delete().eq('id', log.dbId);
    }
  }

  // ─── TOTAIS ───────────────────────────────────────────────────────────────

  const totals = logs.reduce((acc, log) => {
    const grams = effectiveGrams(log, log.amount);
    const factor = grams / 100;
    return {
      kcal: acc.kcal + (log.calories * factor),
      protein: acc.protein + (log.protein * factor),
      carbs: acc.carbs + (log.carbs * factor),
      fat: acc.fat + (log.fat * factor),
    };
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto p-4">

      {/* RESUMO DO DIA */}
      <div className={`p-6 rounded-3xl border-2 shadow-2xl ${currentTheme.border} bg-black/10`}>
        <div className="flex items-center gap-2 mb-6">
          <Utensils className="text-emerald-500" size={24} />
          <h3 className={`text-xl font-black uppercase tracking-tighter ${currentTheme.text}`}>Resumo do Dia</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Kcal', val: `${totals.kcal.toFixed(0)} / ${targetCalories.toFixed(0)}`, color: 'text-blue-400', bg: 'bg-blue-500/10', pct: totals.kcal / targetCalories },
            { label: 'Prot', val: `${totals.protein.toFixed(1)} / ${targetProtein}g`, color: 'text-red-400', bg: 'bg-red-500/10', pct: totals.protein / targetProtein },
            { label: 'Carb', val: `${totals.carbs.toFixed(1)} / ${targetCarbs}g`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', pct: totals.carbs / targetCarbs },
            { label: 'Gord', val: `${totals.fat.toFixed(1)} / ${targetFat}g`, color: 'text-amber-400', bg: 'bg-amber-500/10', pct: totals.fat / targetFat },
          ].map((item, i) => (
            <div key={i} className={`p-4 rounded-2xl border ${currentTheme.border} ${item.bg}`}>
              <p className={`text-[10px] font-black uppercase mb-1 ${item.color}`}>{item.label}</p>
              <p className={`text-lg font-black ${currentTheme.text}`}>{item.val}</p>
              <div className="mt-2 h-1 rounded-full bg-white/10">
                <div
                  className={`h-1 rounded-full ${item.color.replace('text-', 'bg-')}`}
                  style={{ width: `${Math.min((item.pct || 0) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SUGESTÃO DE PROTOCOLO */}
      <div className={`rounded-3xl border-2 transition-all ${currentTheme.border} ${showGuide ? 'bg-emerald-500/5' : 'bg-black/5'}`}>
        <button onClick={() => setShowGuide(!showGuide)} className="w-full p-5 flex items-center justify-between outline-none">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <ChefHat className="text-emerald-500" size={20} />
            </div>
            <div className="text-left">
              <h3 className={`font-black uppercase italic tracking-tighter ${currentTheme.text}`}>Sugestão de Protocolo</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase">
                Baseado no objetivo: {savedProfile?.goal === 'loss' ? 'Perder Gordura' : savedProfile?.goal === 'gain' ? 'Ganhar Massa' : 'Manutenção'}
              </p>
            </div>
          </div>
          {showGuide ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
        </button>
        {showGuide && (
          <div className="px-5 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="col-span-full p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
              <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest italic">
                ⚠️ Sugestão teórica. Consulte um nutricionista para um plano individualizado.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* BUSCADOR */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <div className={`flex items-center rounded-2xl border-2 p-2 transition-all bg-black/20 ${currentTheme.border} focus-within:border-emerald-500`}>
            <Search className="ml-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Buscar alimento no protocolo ARES..."
              className={`w-full p-3 bg-transparent outline-none font-medium ${currentTheme.text}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredFoods.length > 0 && (
            <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border-2 shadow-2xl z-50 overflow-hidden backdrop-blur-md bg-gray-900/95 ${currentTheme.border}`}>
              {filteredFoods.map(food => (
                <button
                  key={food.id}
                  onClick={() => selectFood(food)}
                  className={`w-full flex justify-between items-center p-4 hover:bg-emerald-500/10 border-b last:border-0 ${currentTheme.border}`}
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">{food.name}</p>
                      {food.isCustom && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">Personalizado</span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase">
                      {food.calories}kcal • P:{food.protein}g C:{food.carbs}g G:{food.fat}g
                      {food.unit_type === 'un' ? ' · por unidade' : ' · por 100g'}
                    </p>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ml-3 ${food.unit_type === 'un' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {food.unit_type === 'un' ? 'unidade' : 'gramas'}
                  </span>
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

      {/* CARD DE CONFIRMAÇÃO DO ALIMENTO SELECIONADO */}
      {selectedFood && preview && (
        <div className={`p-5 rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/5 space-y-4`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`font-black text-lg ${currentTheme.text}`}>{selectedFood.name}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase">
                {selectedFood.unit_type === 'un' ? `Medido em unidades (1 un ≈ ${selectedFood.unit_weight}g)` : 'Medido em gramas'}
              </p>
            </div>
            <button onClick={() => setSelectedFood(null)} className="text-gray-500 hover:text-white"><X size={18} /></button>
          </div>

          {/* Seletor de quantidade */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-3 flex-1 p-3 rounded-xl border ${currentTheme.border} bg-black/20`}>
              <button
                onClick={() => setSelectedAmount(a => Math.max(selectedFood.unit_type === 'un' ? 1 : 10, a - (selectedFood.unit_type === 'un' ? 1 : 10)))}
                className="w-8 h-8 rounded-lg bg-white/10 text-white font-black flex items-center justify-center hover:bg-white/20"
              >−</button>
              <input
                type="number"
                className={`flex-1 bg-transparent text-center font-black text-xl outline-none ${currentTheme.text}`}
                value={selectedAmount}
                onChange={e => setSelectedAmount(Number(e.target.value))}
                min={selectedFood.unit_type === 'un' ? 1 : 10}
              />
              <button
                onClick={() => setSelectedAmount(a => a + (selectedFood.unit_type === 'un' ? 1 : 10))}
                className="w-8 h-8 rounded-lg bg-white/10 text-white font-black flex items-center justify-center hover:bg-white/20"
              >+</button>
            </div>
            <span className={`text-sm font-black uppercase ${currentTheme.subtext}`}>
              {selectedFood.unit_type === 'un' ? 'un' : 'g'}
            </span>
          </div>

          {/* Preview de macros */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Kcal', val: preview.kcal, color: 'text-blue-400' },
              { label: 'Prot', val: `${preview.protein}g`, color: 'text-red-400' },
              { label: 'Carb', val: `${preview.carbs}g`, color: 'text-emerald-400' },
              { label: 'Gord', val: `${preview.fat}g`, color: 'text-amber-400' },
            ].map((m, i) => (
              <div key={i} className="text-center p-2 rounded-xl bg-black/20">
                <p className={`text-[9px] font-black uppercase ${m.color}`}>{m.label}</p>
                <p className={`font-black text-sm ${currentTheme.text}`}>{m.val}</p>
              </div>
            ))}
          </div>

          {selectedFood.unit_type === 'un' && (
            <p className="text-[10px] text-gray-500 text-center font-bold">
              {selectedAmount} unidade{selectedAmount > 1 ? 's' : ''} = {preview.grams}g efetivos
            </p>
          )}

          <button
            onClick={confirmAdd}
            className="w-full p-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} /> Confirmar Registro
          </button>
        </div>
      )}

      {/* MODAL MANUAL */}
      {showManual && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-3xl border-2 shadow-2xl bg-gray-900 ${currentTheme.border}`}>
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-white font-black uppercase italic text-xl">Novo Alimento</h4>
              <button onClick={() => setShowManual(false)} className="text-gray-500 hover:text-white"><X /></button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome do Alimento"
                className={`w-full p-4 rounded-xl bg-black/40 border ${currentTheme.border} text-white outline-none focus:border-emerald-500`}
                value={mName}
                onChange={e => setMName(e.target.value)}
              />

              {/* Tipo de medida */}
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Como esse alimento é medido?</p>
                <div className="flex gap-3">
                  {(['g', 'un'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setMUnitType(type)}
                      className={`flex-1 p-3 rounded-xl border font-black text-sm uppercase transition-all ${mUnitType === type ? 'bg-emerald-500 text-white border-emerald-500' : `${currentTheme.border} text-gray-400 bg-black/20`}`}
                    >
                      {type === 'g' ? '⚖️ Gramas' : '🥚 Unidade'}
                    </button>
                  ))}
                </div>
              </div>

              {mUnitType === 'un' && (
                <input
                  type="number"
                  placeholder="Peso por unidade em gramas (ex: ovo = 50)"
                  className={`w-full p-4 rounded-xl bg-black/40 border ${currentTheme.border} text-white outline-none`}
                  value={mUnitWeight}
                  onChange={e => setMUnitWeight(e.target.value)}
                />
              )}

              <p className="text-[10px] text-gray-500 font-bold uppercase">
                Macros {mUnitType === 'un' ? 'por unidade' : 'por 100g'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Kcal" className={`p-4 rounded-xl bg-black/40 border ${currentTheme.border} text-white outline-none`} value={mKcal} onChange={e => setMKcal(e.target.value)} />
                <input type="number" placeholder="Prot (g)" className={`p-4 rounded-xl bg-black/40 border ${currentTheme.border} text-white outline-none`} value={mProt} onChange={e => setMProt(e.target.value)} />
                <input type="number" placeholder="Carb (g)" className={`p-4 rounded-xl bg-black/40 border ${currentTheme.border} text-white outline-none`} value={mCarb} onChange={e => setMCarb(e.target.value)} />
                <input type="number" placeholder="Gord (g)" className={`p-4 rounded-xl bg-black/40 border ${currentTheme.border} text-white outline-none`} value={mGord} onChange={e => setMGord(e.target.value)} />
              </div>
              <button
                onClick={addManualFood}
                className="w-full p-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest"
              >
                Salvar e Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTÓRICO DO DIA */}
      <div className="space-y-3">
        {loading ? (
          <p className={`text-center text-sm font-bold ${currentTheme.subtext}`}>Carregando registros do dia...</p>
        ) : logs.length === 0 ? (
          <div className={`text-center p-8 rounded-2xl border border-dashed ${currentTheme.border}`}>
            <p className={`text-sm font-bold ${currentTheme.subtext}`}>Nenhum alimento registrado hoje.</p>
          </div>
        ) : (
          logs.map(log => {
            const grams = effectiveGrams(log, log.amount);
            const factor = grams / 100;
            return (
              <div key={log.instanceId} className={`flex items-center justify-between p-5 rounded-2xl border bg-black/10 ${currentTheme.border}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-bold text-lg ${currentTheme.text}`}>{log.name}</p>
                    {log.isCustom && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">Custom</span>}
                  </div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                    {log.amount} {log.unit_type === 'un' ? `un (${grams}g)` : 'g'}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="font-black text-emerald-500 text-xl">{(log.calories * factor).toFixed(0)} <span className="text-[10px] uppercase">kcal</span></p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">P:{(log.protein * factor).toFixed(1)}g | C:{(log.carbs * factor).toFixed(1)}g</p>
                  </div>
                  <button onClick={() => removeLog(log)} className="p-3 text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}