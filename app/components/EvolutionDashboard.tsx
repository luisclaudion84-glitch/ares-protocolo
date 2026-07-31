// app/components/EvolutionDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { Footprints, Zap, Save, TrendingUp, Droplets, Activity, BarChart3, Weight, Timer } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { initialWorkouts } from '../data/workoutData';

// ─── MAPEAMENTO exercise_id → nome legível ────────────────────────────────────
const EXERCISE_NAME_MAP: Record<string, string> = {};
initialWorkouts.forEach(workout => {
  workout.exercises?.forEach((ex: any) => {
    if (ex.id && ex.name) {
      EXERCISE_NAME_MAP[ex.id] = ex.name;
    }
  });
});

// ─── TIPOS ───────────────────────────────────────────────────────────────────
interface ChartTheme {
  primary: string;
  secondary: string;
  tertiary: string;
  grid: string;
  text: string;
  tooltipBg: string;
  tooltipText: string;
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export function EvolutionDashboard({ currentTheme }: { currentTheme: any }) {
  const [waterData, setWaterData] = useState<any[]>([]);
  const [loadData, setLoadData] = useState<any[]>([]);
  const [zone2Data, setZone2Data] = useState<any[]>([]);
  const [exerciseList, setExerciseList] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'water' | 'load' | 'zone2'>('water');

  const [marker, setMarker] = useState({ date: new Date().toISOString().split('T')[0], steps: '', pai: '' });
  const [markerSaved, setMarkerSaved] = useState(false);

  const isDark = !currentTheme?.card?.includes('white') &&
                 !currentTheme?.card?.includes('gray-100') &&
                 !currentTheme?.card?.includes('slate-100');

  const chartTheme: ChartTheme = {
    primary: isDark ? '#06b6d4' : '#0891b2',
    secondary: isDark ? '#10b981' : '#059669',
    tertiary: isDark ? '#f59e0b' : '#d97706',
    grid: isDark ? '#ffffff15' : '#00000015',
    text: isDark ? '#94a3b8' : '#475569',
    tooltipBg: isDark ? '#1e293b' : '#f8fafc',
    tooltipText: isDark ? '#e2e8f0' : '#334155',
  };

  // ─── FETCH DE DADOS ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchWater(), fetchExercises(), fetchZone2()]);
    setLoading(false);
  }

  async function fetchWater() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const since = new Date();
    since.setDate(since.getDate() - 6);

    const { data } = await supabase
      .from('water_logs')
      .select('amount, created_at')
      .eq('user_id', user.id)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });

    if (!data) return;

    const grouped: Record<string, number> = {};
    data.forEach(row => {
      const day = new Date(row.created_at).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
      grouped[day] = (grouped[day] || 0) + row.amount;
    });

    setWaterData(Object.entries(grouped).map(([day, total]) => ({ day, total })));
  }

  async function fetchExercises() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('exercise_records')
      .select('exercise_id, weight, set_index, session_id')
      .eq('user_id', user.id)
      .order('session_id', { ascending: true });

    if (!data || data.length === 0) return;

    const ids = [...new Set(data.map(r => r.exercise_id))];
    const strengthIds = ids.filter(id => {
      const name = (EXERCISE_NAME_MAP[id] || '').toLowerCase();
      return !name.includes('esteira') && !name.includes('caminhada') && !name.includes('liss') && !id.includes('liss');
    });

    setExerciseList(strengthIds);
    if (strengthIds.length > 0) setSelectedExercise(strengthIds[0]);

    buildLoadChart(strengthIds[0], data);
  }

  function buildLoadChart(exerciseId: string, data: any[]) {
    const filtered = data.filter(r => r.exercise_id === exerciseId);
    const grouped: Record<string, number> = {};
    filtered.forEach(r => {
      const w = parseFloat(r.weight) || 0;
      if (!grouped[r.session_id] || w > grouped[r.session_id]) {
        grouped[r.session_id] = w;
      }
    });

    const chartData = Object.entries(grouped).map(([session, maxWeight], idx) => ({
      sessao: `S${idx + 1}`,
      carga: maxWeight,
    }));

    setLoadData(chartData);
  }

  async function fetchZone2() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const since = new Date();
    since.setDate(since.getDate() - 6);

    const { data } = await supabase
      .from('exercise_records')
      .select('zone_2_minutes, session_id')
      .eq('user_id', user.id)
      .gte('zone_2_minutes', 1)
      .gte('created_at', since.toISOString())
      .order('session_id', { ascending: true });

    if (!data) return;

    const grouped: Record<string, number> = {};
    data.forEach((r, idx) => {
      const key = `S${idx + 1}`;
      grouped[key] = (grouped[key] || 0) + (r.zone_2_minutes || 0);
    });

    setZone2Data(Object.entries(grouped).map(([sessao, minutos]) => ({ sessao, minutos })));
  }

  // ─── SALVAR MARCADORES ───────────────────────────────────────────────────────
  async function saveMarker() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('daily_markers').insert([{
      user_id: user.id,
      date: marker.date,
      steps: marker.steps ? parseInt(marker.steps) : null,
      pai: marker.pai ? parseInt(marker.pai) : null,
    }]);

    setMarkerSaved(true);
    setTimeout(() => setMarkerSaved(false), 2000);
  }

  // ─── TOOLTIP CUSTOMIZADO ─────────────────────────────────────────────────────
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl p-3 shadow-xl text-xs font-bold border border-white/10"
           style={{ background: chartTheme.tooltipBg, color: chartTheme.tooltipText }}>
        <p className="mb-1 opacity-70">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  };

  // ─── RENDER DO GRÁFICO ATIVO ─────────────────────────────────────────────────
  const renderChart = () => {
    if (activeChart === 'water') {
      if (waterData.length === 0) return <p className={`text-center text-sm py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Nenhum registro de hidratação.</p>;
      return (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={waterData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis dataKey="day" tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 700 }} />
            <YAxis tick={{ fill: chartTheme.text, fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" name="ml" fill={chartTheme.primary} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (activeChart === 'load') {
      if (loadData.length === 0) return <p className={`text-center text-sm py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Nenhum registro de carga.</p>;
      return (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={loadData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis dataKey="sessao" tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 700 }} />
            <YAxis tick={{ fill: chartTheme.text, fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="carga" name="kg" stroke={chartTheme.secondary} strokeWidth={3} dot={{ fill: chartTheme.secondary, r: 5 }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (activeChart === 'zone2') {
      if (zone2Data.length === 0) return <p className={`text-center text-sm py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Nenhum registro de Zona 2.</p>;
      return (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={zone2Data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis dataKey="sessao" tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 700 }} />
            <YAxis tick={{ fill: chartTheme.text, fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="minutos" name="min" stroke={chartTheme.tertiary} strokeWidth={3} dot={{ fill: chartTheme.tertiary, r: 5 }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  // ─── EVOLUÇÃO % DA CARGA ─────────────────────────────────────────────────────
  const loadEvolution = activeChart === 'load' && loadData.length >= 2
    ? (() => {
        const first = loadData[0].carga;
        const last = loadData[loadData.length - 1].carga;
        const pct = first > 0 ? (((last - first) / first) * 100).toFixed(1) : '0';
        return { pct, positive: last >= first };
      })()
    : null;

  if (loading) {
    return (
      <div className={`w-full max-w-2xl mx-auto p-8 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        <Activity className="mx-auto mb-3 animate-pulse" size={32} />
        <p className="text-sm font-bold uppercase tracking-widest">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-10">

      {/* ── MARCADORES DO SMARTWATCH ─────────────────────────────────────────── */}
      <div className={`rounded-3xl p-6 border shadow-xl ${currentTheme.card} ${currentTheme.border}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-violet-500/20 p-2 rounded-full">
            <Zap className="text-violet-400" size={22} />
          </div>
          <div>
            <h3 className={`text-lg font-black uppercase italic tracking-tighter ${currentTheme.text}`}>
              Marcadores do Dia
            </h3>
            <p className={`text-[10px] font-bold ${currentTheme.subtext}`}>DADOS DO SMARTWATCH</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <label className={`text-[10px] font-black uppercase flex items-center gap-1 ${currentTheme.subtext}`}>
              <Footprints size={10} /> Passos
            </label>
            <input
              type="number"
              placeholder="Ex: 8500"
              value={marker.steps}
              onChange={e => setMarker({ ...marker, steps: e.target.value })}
              className={`w-full p-3 rounded-2xl border outline-none focus:border-violet-500 text-center font-bold text-sm ${currentTheme.border} ${currentTheme.card} ${currentTheme.text}`}
            />
          </div>

          <div className="space-y-1">
            <label className={`text-[10px] font-black uppercase flex items-center gap-1 ${currentTheme.subtext}`}>
              <Zap size={10} /> PAI
            </label>
            <input
              type="number"
              placeholder="Ex: 85"
              value={marker.pai}
              onChange={e => setMarker({ ...marker, pai: e.target.value })}
              className={`w-full p-3 rounded-2xl border outline-none focus:border-violet-500 text-center font-bold text-sm ${currentTheme.border} ${currentTheme.card} ${currentTheme.text}`}
            />
          </div>
        </div>

        <p className={`text-[10px] font-bold ${currentTheme.subtext} mb-4`}>
          * RPE e Qualidade de Sono são registrados no módulo de Treino.
        </p>

        <button
          onClick={saveMarker}
          className={`w-full p-4 font-black rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 text-sm
            ${markerSaved ? 'bg-green-500 text-white' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}
        >
          <Save size={16} />
          {markerSaved ? 'Marcadores Salvos!' : 'Salvar Marcadores'}
        </button>
      </div>

      {/* ── GRÁFICO UNIFICADO ──────────────────────────────────────────────────── */}
      <div className={`rounded-3xl p-6 border shadow-xl ${currentTheme.card} ${currentTheme.border}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-full">
              <BarChart3 className="text-blue-400" size={22} />
            </div>
            <div>
              <h3 className={`text-lg font-black uppercase italic tracking-tighter ${currentTheme.text}`}>
                {activeChart === 'water' && 'Hidratação'}
                {activeChart === 'load' && 'Evolução de Carga'}
                {activeChart === 'zone2' && 'Cardio Zona 2'}
              </h3>
              <p className={`text-[10px] font-bold ${currentTheme.subtext}`}>
                {activeChart === 'water' && 'CONSUMO DIÁRIO (ML) — 7 DIAS'}
                {activeChart === 'load' && 'MÁXIMO POR SESSÃO (KG)'}
                {activeChart === 'zone2' && 'MINUTOS POR SESSÃO'}
              </p>
            </div>
          </div>
          {activeChart === 'load' && loadEvolution && (
            <span className={`text-sm font-black px-3 py-1 rounded-full ${loadEvolution.positive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
              {loadEvolution.positive ? '+' : ''}{loadEvolution.pct}%
            </span>
          )}
        </div>

        {/* Seletor de exercício (apenas quando gráfico de carga) */}
        {activeChart === 'load' && (
          <select
            value={selectedExercise}
            onChange={e => {
              setSelectedExercise(e.target.value);
              supabase.auth.getUser().then(({ data: { user } }) => {
                if (!user) return;
                supabase.from('exercise_records')
                  .select('exercise_id, weight, set_index, session_id')
                  .eq('user_id', user.id)
                  .then(({ data }) => {
                    if (data) buildLoadChart(e.target.value, data);
                  });
              });
            }}
            className={`w-full mb-4 p-3 rounded-2xl border outline-none font-bold text-sm ${currentTheme.border} ${currentTheme.card} ${currentTheme.text}`}
            style={{ backgroundColor: 'transparent' }}
          >
            {exerciseList.map(id => (
              <option key={id} value={id} style={{ color: isDark ? '#fff' : '#000', backgroundColor: isDark ? '#1e293b' : '#fff' }}>
                {EXERCISE_NAME_MAP[id] || id}
              </option>
            ))}
          </select>
        )}

        {/* Área do gráfico */}
        {renderChart()}

        {/* Botões de seleção do gráfico */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveChart('water')}
            className={`flex-1 p-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all
              ${activeChart === 'water' ? 'bg-cyan-500 text-white shadow-lg' : `${currentTheme.card} ${currentTheme.border} ${currentTheme.subtext} hover:opacity-80`}`}
          >
            <Droplets size={14} /> Água
          </button>
          <button
            onClick={() => setActiveChart('load')}
            className={`flex-1 p-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all
              ${activeChart === 'load' ? 'bg-emerald-500 text-white shadow-lg' : `${currentTheme.card} ${currentTheme.border} ${currentTheme.subtext} hover:opacity-80`}`}
          >
            <Weight size={14} /> Carga
          </button>
          <button
            onClick={() => setActiveChart('zone2')}
            className={`flex-1 p-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all
              ${activeChart === 'zone2' ? 'bg-amber-500 text-white shadow-lg' : `${currentTheme.card} ${currentTheme.border} ${currentTheme.subtext} hover:opacity-80`}`}
          >
            <Timer size={14} /> Zona 2
          </button>
        </div>
      </div>

    </div>
  );
}