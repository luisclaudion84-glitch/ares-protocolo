// app/components/UserProfile.tsx
import React, { useState, useEffect } from 'react';
import { User, Calculator, CheckCircle } from 'lucide-react';
import { saveProfile, loadProfile, calculateMacros } from '../lib/profileStorage';

export function UserProfileComponent({ currentTheme }: { currentTheme: any }) {
  const [profile, setProfile] = useState({
    name: '', age: 25, gender: 'male' as 'male' | 'female',
    weight: 80, height: 175, activityLevel: 'moderate', goal: 'maintenance'
  });

  const [results, setResults] = useState({ tmb: 0, tdee: 0, target: 0, protein: 0, carbs: 0, fat: 0 });
  const [saved, setSaved] = useState(false);

  // Carrega perfil salvo ao abrir o app
  useEffect(() => {
    const stored = loadProfile();
    if (stored) {
      setProfile({
        name: stored.name,
        age: stored.age,
        gender: stored.gender,
        weight: stored.weight,
        height: stored.height,
        activityLevel: stored.activityLevel,
        goal: stored.goal
      });
      setResults({
        tmb: stored.tmb,
        tdee: stored.tdee,
        target: stored.targetCalories,
        protein: stored.targetProtein,
        carbs: stored.targetCarbs,
        fat: stored.targetFat
      });
    }
  }, []);

  const calculateAndSave = () => {
    const { weight, height, age, gender, activityLevel, goal } = profile;

    // TMB — Mifflin-St Jeor
    let tmb = (10 * weight) + (6.25 * height) - (5 * age);
    tmb = gender === 'male' ? tmb + 5 : tmb - 161;

    // Fator de Atividade
    const multipliers: Record<string, number> = {
      sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9
    };
    const tdee = tmb * (multipliers[activityLevel] || 1.55);

    // Ajuste por Objetivo
    let target = tdee;
    if (goal === 'loss') target -= 500;
    if (goal === 'gain') target += 300;

    // Macros
    const macros = calculateMacros({ weight, goal, targetCalories: target });

    const newResults = {
      tmb, tdee, target,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat
    };

    setResults(newResults);

    // Salva no LocalStorage
    saveProfile({
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      weight: profile.weight,
      height: profile.height,
      activityLevel: profile.activityLevel,
      goal: profile.goal,
      tmb,
      tdee,
      targetCalories: target,
      targetProtein: macros.protein,
      targetCarbs: macros.carbs,
      targetFat: macros.fat
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const goalLabel: Record<string, string> = {
    loss: '🔥 Perda de Gordura',
    maintenance: '⚖️ Manutenção',
    gain: '💪 Hipertrofia'
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto p-4">

      {/* FORMULÁRIO */}
      <div className={`p-8 rounded-3xl border-2 shadow-2xl backdrop-blur-sm ${currentTheme.border} bg-black/10`}>
        
        {/* Título Centralizado */}
        <div className="flex flex-col items-center gap-3 mb-10 border-b pb-6 border-white/10 w-full">
          <div className="bg-emerald-500/20 p-3 rounded-full">
            <User className="text-emerald-500" size={32} />
          </div>
          <h2 className={`text-2xl font-black uppercase italic tracking-tighter text-center ${currentTheme.text}`}>
            Inicie o seu projeto aqui
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna Esquerda */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-[10px] font-black uppercase text-gray-500 ml-2">Nome Completo</span>
              <input type="text" placeholder="Seu nome..."
                className={`w-full p-4 rounded-2xl bg-black/30 border ${currentTheme.border} ${currentTheme.text} outline-none focus:border-emerald-500 transition-colors`}
                value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="text-[10px] font-black uppercase text-gray-500 ml-2">Idade</span>
                <input type="number"
                  className={`w-full p-4 rounded-2xl bg-black/30 border ${currentTheme.border} ${currentTheme.text} outline-none focus:border-emerald-500 text-center font-bold`}
                  value={profile.age} onChange={e => setProfile({...profile, age: Number(e.target.value)})} />
              </label>
              <label>
                <span className="text-[10px] font-black uppercase text-gray-500 ml-2">Sexo</span>
                <select className={`w-full p-4 rounded-2xl bg-black/30 border ${currentTheme.border} ${currentTheme.text} outline-none appearance-none`}
                  value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value as 'male' | 'female'})}>
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="text-[10px] font-black uppercase text-gray-500 ml-2">Peso (kg)</span>
                <input type="number"
                  className={`w-full p-4 rounded-2xl bg-black/30 border ${currentTheme.border} ${currentTheme.text} outline-none focus:border-emerald-500 text-center font-bold`}
                  value={profile.weight} onChange={e => setProfile({...profile, weight: Number(e.target.value)})} />
              </label>
              <label>
                <span className="text-[10px] font-black uppercase text-gray-500 ml-2">Altura (cm)</span>
                <input type="number"
                  className={`w-full p-4 rounded-2xl bg-black/30 border ${currentTheme.border} ${currentTheme.text} outline-none focus:border-emerald-500 text-center font-bold`}
                  value={profile.height} onChange={e => setProfile({...profile, height: Number(e.target.value)})} />
              </label>
            </div>
          </div>

          {/* Coluna Direita */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-[10px] font-black uppercase text-gray-500 ml-2">Nível de Atividade</span>
              <select className={`w-full p-4 rounded-2xl bg-black/30 border ${currentTheme.border} ${currentTheme.text} outline-none appearance-none`}
                value={profile.activityLevel} onChange={e => setProfile({...profile, activityLevel: e.target.value})}>
                <option value="sedentary">Sedentário (Pouco exercício)</option>
                <option value="light">Leve (1-2x semana)</option>
                <option value="moderate">Moderado (3-5x semana)</option>
                <option value="active">Ativo (6-7x semana)</option>
                <option value="very_active">Atleta (2x dia)</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[10px] font-black uppercase text-gray-500 ml-2">Objetivo Principal</span>
              <select className={`w-full p-4 rounded-2xl bg-black/30 border ${currentTheme.border} ${currentTheme.text} outline-none appearance-none`}
                value={profile.goal} onChange={e => setProfile({...profile, goal: e.target.value})}>
                <option value="loss">🔥 Perder Gordura (Definição)</option>
                <option value="maintenance">⚖️ Manutenção (Saúde)</option>
                <option value="gain">💪 Ganhar Massa (Hipertrofia)</option>
              </select>
            </label>
          </div>
        </div>

        {/* Botão */}
        <button onClick={calculateAndSave}
          className={`w-full mt-8 p-5 font-black rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl
            ${saved 
              ? 'bg-green-500 shadow-green-500/20' 
              : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'}`}>
          {saved 
            ? <><CheckCircle size={20} /> Protocolo Salvo!</>
            : <><Calculator size={20} /> Calcular Meu Protocolo</>}
        </button>
      </div>

      {/* RESULTADOS */}
      {results.target > 0 && (
        <div className={`p-8 rounded-3xl border-2 shadow-2xl ${currentTheme.border} bg-emerald-500/5`}>
          <div className="text-center mb-6">
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">
              {goalLabel[profile.goal]} — Meta Diária
            </p>
            <p className="text-6xl font-black text-emerald-500">
              {results.target.toFixed(0)} <span className="text-xl text-gray-400">kcal</span>
            </p>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
              <p className="text-[10px] font-black text-red-400 uppercase mb-1">Proteína</p>
              <p className={`text-2xl font-black ${currentTheme.text}`}>{results.protein}g</p>
              <p className="text-[9px] text-gray-500">{(results.protein * 4).toFixed(0)} kcal</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">Carboidrato</p>
              <p className={`text-2xl font-black ${currentTheme.text}`}>{results.carbs}g</p>
              <p className="text-[9px] text-gray-500">{(results.carbs * 4).toFixed(0)} kcal</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-[10px] font-black text-amber-400 uppercase mb-1">Gordura</p>
              <p className={`text-2xl font-black ${currentTheme.text}`}>{results.fat}g</p>
              <p className="text-[9px] text-gray-500">{(results.fat * 9).toFixed(0)} kcal</p>
            </div>
          </div>

          {/* TMB e TDEE */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5 text-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Basal (TMB)</p>
              <p className={`text-lg font-bold ${currentTheme.text}`}>{results.tmb.toFixed(0)} kcal</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5 text-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Total (TDEE)</p>
              <p className={`text-lg font-bold ${currentTheme.text}`}>{results.tdee.toFixed(0)} kcal</p>
            </div>
          </div>

          <p className="text-center text-[10px] text-gray-600 mt-4 uppercase tracking-widest">
            ✅ Protocolo salvo — os módulos de Nutrição e Água já foram atualizados
          </p>
        </div>
      )}
    </div>
  );
}