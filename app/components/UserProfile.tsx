// app/components/UserProfile.tsx
import React, { useState, useEffect, useRef } from 'react';
import { User, Calculator, CheckCircle } from 'lucide-react';
import {
  calculateTMB,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
  saveProfile,
} from '../lib/profileStorage';
import { supabase } from '../lib/supabase';

export function UserProfileComponent({ currentTheme }: { currentTheme: any }) {
  const [profile, setProfile] = useState({
    name: '', age: 25, gender: 'male' as 'male' | 'female',
    weight: 80, height: 175, activityLevel: 'moderate', goal: 'maintenance',
    maintenanceIntent: 'stability' as 'stability' | 'recomposition' | 'preserve' | 'performance',
  });

  const [results, setResults] = useState({ tmb: 0, tdee: 0, target: 0, protein: 0, carbs: 0, fat: 0 });
  const [saved, setSaved] = useState(false);
  const [calculatedGoal, setCalculatedGoal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Referência para o scroll automático
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadFromSupabase() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile({
          name: data.name || '',
          age: data.age || 25,
          gender: data.gender || 'male',
          weight: data.weight || 80,
          height: data.height || 175,
          activityLevel: data.activity_level || 'moderate',
          goal: data.goal || 'maintenance',
          maintenanceIntent: (data.maintenance_intent ?? 'stability') as any,
        });
        setCalculatedGoal(data.goal);
        setResults({
          tmb: data.tmb || 0,
          tdee: data.tdee || 0,
          target: data.target_calories || 0,
          protein: data.target_protein || 0,
          carbs: data.target_carbs || 0,
          fat: data.target_fat || 0,
        });
      }
      setLoading(false);
    }
    loadFromSupabase();
  }, []);

  const calculateAndSave = async () => {
    const { weight, height, age, gender, activityLevel, goal, maintenanceIntent } = profile;

    const tmb    = calculateTMB({ weight, height, age, gender });
    const tdee   = calculateTDEE(tmb, activityLevel);
    const target = calculateTargetCalories(tdee, goal);
    const macros = calculateMacros({ weight, goal, targetCalories: target });

    setResults({ tmb, tdee, target, protein: macros.protein, carbs: macros.carbs, fat: macros.fat });
    setCalculatedGoal(goal);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      name: profile.name,
      age,
      gender,
      weight,
      height,
      activity_level: activityLevel,
      goal,
      maintenance_intent: goal === 'maintenance' ? maintenanceIntent : null,
      tmb,
      tdee,
      target_calories: target,
      target_protein: macros.protein,
      target_carbs: macros.carbs,
      target_fat: macros.fat,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'user_id' });

    if (!error) {
      saveProfile({
        ...profile,
        maintenanceIntent: goal === 'maintenance' ? maintenanceIntent : undefined,
        tmb, tdee,
        targetCalories: target,
        targetProtein: macros.protein,
        targetCarbs: macros.carbs,
        targetFat: macros.fat,
      });

      setSaved(true);
      
      // Scroll automático para os resultados
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

      setTimeout(() => setSaved(false), 3000);
    }
  };

  const goalConfig: Record<string, { label: string; emoji: string; color: string; bg: string; border: string; description: string }> = {
    loss: { label: 'Perda de Gordura', emoji: '🔥', color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/50', description: 'Déficit calórico moderado para perda de gordura.' },
    maintenance: { label: 'Manutenção', emoji: '⚖️', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/50', description: 'Equilíbrio calórico para manter peso.' },
    gain: { label: 'Hipertrofia', emoji: '💪', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/50', description: 'Superávit calórico para ganho de massa.' },
  };

  if (loading) return <div className="p-20 text-center">Carregando...</div>;

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto p-4">
      <div className={`p-8 rounded-3xl border-2 shadow-2xl backdrop-blur-sm ${currentTheme.border} bg-black/10`}>
        <div className="flex flex-col items-center gap-3 mb-10 border-b pb-6 border-white/10 w-full">
          <div className="bg-emerald-500/20 p-3 rounded-full"><User className="text-emerald-500" size={32} /></div>
          <h2 className={`text-2xl font-black uppercase italic tracking-tighter ${currentTheme.text}`}>Inicie o seu projeto aqui</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
           {/* Campos de Input (Nome, Idade, Peso...) - Mantidos idênticos ao original */}
           <div className="space-y-4">
              <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} placeholder="Seu nome..." className={`w-full p-4 rounded-2xl bg-black/30 border ${currentTheme.border} ${currentTheme.text}`} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={profile.age} onChange={e => setProfile({...profile, age: Number(e.target.value)})} className={`w-full p-4 rounded-2xl bg-black/30 border ${currentTheme.border} text-center`} />
                <select value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value as any})} className={`w-full p-4 rounded-2xl bg-black/30 border ${currentTheme.border} ${currentTheme.text}`}>
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={profile.weight} onChange={e => setProfile({...profile, weight: Number(e.target.value)})} className={`w-full p-4 rounded-2xl bg-black/30 border ${currentTheme.border} text-center`} />
                <input type="number" value={profile.height} onChange={e => setProfile({...profile, height: Number(e.target.value)})} className={`w-full p-4 rounded-2xl bg-black/30 border ${currentTheme.border} text-center`} />
              </div>
           </div>
           <div className="space-y-4">
              <select value={profile.activityLevel} onChange={e => setProfile({...profile, activityLevel: e.target.value})} className={`w-full p-4 rounded-2xl bg-black/30 border ${currentTheme.border} ${currentTheme.text}`}>
                <option value="sedentary">Sedentário</option>
                <option value="light">Leve</option>
                <option value="moderate">Moderado</option>
                <option value="active">Ativo</option>
                <option value="very_active">Atleta</option>
              </select>
              <select value={profile.goal} onChange={e => setProfile({...profile, goal: e.target.value})} className={`w-full p-4 rounded-2xl bg-black/30 border ${currentTheme.border} ${currentTheme.text}`}>
                <option value="loss">Perder Gordura</option>
                <option value="maintenance">Manutenção</option>
                <option value="gain">Ganhar Massa</option>
              </select>
           </div>
        </div>

        <button onClick={calculateAndSave} className={`w-full mt-8 p-5 font-black rounded-2xl transition-all uppercase flex items-center justify-center gap-2 ${saved ? 'bg-green-500' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
          {saved ? <><CheckCircle size={20} /> Salvo!</> : <><Calculator size={20} /> Calcular Meu Protocolo</>}
        </button>
      </div>

      {/* Âncora para o Scroll Automático */}
      <div ref={resultsRef} className="scroll-mt-24">
        {results.target > 0 && (
          <div className={`p-8 rounded-3xl border-2 shadow-2xl ${currentTheme.border} bg-emerald-500/5`}>
            <p className="text-center text-[11px] font-black uppercase text-gray-500">Meta Diária</p>
            <p className="text-center text-6xl font-black text-emerald-500">{results.target.toFixed(0)} <span className="text-xl">kcal</span></p>
            {/* Macros e Resumo aqui... */}
          </div>
        )}
      </div>
    </div>
  );
}