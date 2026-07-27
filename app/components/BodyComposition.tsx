// app/components/BodyComposition.tsx
import React, { useState, useEffect } from 'react';
import { Ruler, Save, History, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { EvolutionDashboard } from './EvolutionDashboard';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

export function BodyComposition({ currentTheme }: { currentTheme: any }) {
  const [measure, setMeasure] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: 80, chest: 100, waist: 90, biceps: 35, thigh: 60, calf: 40
  });
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [activeMetric, setActiveMetric] = useState<'weight' | 'waist' | 'chest' | 'biceps' | 'thigh' | 'calf'>('weight');

  const isDark = !currentTheme?.card?.includes('white') &&
                 !currentTheme?.card?.includes('gray-100') &&
                 !currentTheme?.card?.includes('slate-100');

  const chartColors = {
    weight: '#10b981',
    waist: '#06b6d4',
    chest: '#f59e0b',
    biceps: '#a78bfa',
    thigh: '#f472b6',
    calf: '#fb923c',
  };

  const metricLabels = {
    weight: 'Peso (kg)',
    waist: 'Cintura (cm)',
    chest: 'Peitoral (cm)',
    biceps: 'Braço (cm)',
    thigh: 'Coxa (cm)',
    calf: 'Panturrilha (cm)',
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    const { data } = await supabase
      .from('body_measurements')
      .select('*')
      .order('date', { ascending: true })
      .limit(10);

    if (data) setHistory(data);
  }

  const handleSave = async () => {
    await supabase.from('body_measurements').insert([{
      date: measure.date,
      weight: measure.weight,
      chest: measure.chest,
      waist: measure.waist,
      biceps: measure.biceps,
      thigh: measure.thigh,
      calf: measure.calf,
    }]);
    setSaved(true);
    fetchHistory();
    setTimeout(() => setSaved(false), 2000);
  };

  const evolution = history.length >= 2
    ? (() => {
        const first = history[0][activeMetric];
        const last = history[history.length - 1][activeMetric];
        const pct = first > 0 ? (((last - first) / first) * 100).toFixed(1) : '0';
        return { pct, positive: last >= first };
      })()
    : null;

  const chartData = history.map(h => ({
    data: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    valor: h[activeMetric],
  }));

  const gridColor = isDark ? '#ffffff15' : '#00000015';
  const tickColor = isDark ? '#94a3b8' : '#475569';
  const tooltipBg = isDark ? '#1e293b' : '#f8fafc';
  const tooltipText = isDark ? '#e2e8f0' : '#334155';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl p-3 shadow-xl text-xs font-bold border border-white/10"
           style={{ background: tooltipBg, color: tooltipText }}>
        <p className="mb-1 opacity-70">{label}</p>
        <p style={{ color: chartColors[activeMetric] }}>
          {metricLabels[activeMetric]}: {payload[0].value}
        </p>
      </div>
    );
  };

  const InputField = ({ label, value, field }: any) => (
    <div className="space-y-1">
      <span className="text-[10px] font-black uppercase text-gray-500 ml-2">{label}</span>
      <input
        type="number"
        className={`w-full p-4 rounded-2xl border outline-none focus:border-emerald-500 text-center font-bold ${currentTheme.border} ${currentTheme.card} ${currentTheme.text}`}
        value={value}
        onChange={(e) => setMeasure({...measure, [field]: Number(e.target.value)})}
      />
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">

      {/* ── FORMULÁRIO DE MEDIDAS ─────────────────────────────────────────────── */}
      <div className={`p-8 rounded-3xl border-2 shadow-2xl backdrop-blur-sm ${currentTheme.border} ${currentTheme.card}`}>
        <div className="flex flex-col items-center gap-3 mb-10 border-b pb-6 border-white/10 w-full">
          <div className="bg-emerald-500/20 p-3 rounded-full">
            <Ruler className="text-emerald-500" size={32} />
          </div>
          <h2 className={`text-2xl font-black uppercase italic tracking-tighter text-center ${currentTheme.text}`}>
            Avaliação Corporal
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <InputField label="Peso (kg)" value={measure.weight} field="weight" />
          <InputField label="Cintura (cm)" value={measure.waist} field="waist" />
          <InputField label="Peitoral (cm)" value={measure.chest} field="chest" />
          <InputField label="Braço (cm)" value={measure.biceps} field="biceps" />
          <InputField label="Coxa (cm)" value={measure.thigh} field="thigh" />
          <InputField label="Panturrilha (cm)" value={measure.calf} field="calf" />
        </div>

        <button
          onClick={handleSave}
          className={`w-full mt-8 p-5 font-black rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl
            ${saved ? 'bg-green-500 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
        >
          {saved ? <><History size={20} /> Medidas Salvas!</> : <><Save size={20} /> Registrar Medidas de Hoje</>}
        </button>
      </div>

      {/* ── GRÁFICO DE EVOLUÇÃO CORPORAL ──────────────────────────────────────── */}
      {history.length > 0 && (
        <div className={`rounded-3xl p-6 border shadow-xl ${currentTheme.card} ${currentTheme.border}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-full">
                <TrendingDown className="text-emerald-400" size={22} />
              </div>
              <div>
                <h3 className={`text-lg font-black uppercase italic tracking-tighter ${currentTheme.text}`}>
                  Evolução Corporal
                </h3>
                <p className={`text-[10px] font-bold ${currentTheme.subtext}`}>
                  {metricLabels[activeMetric].toUpperCase()} — ÚLTIMOS REGISTROS
                </p>
              </div>
            </div>
            {evolution && (
              <span className={`text-sm font-black px-3 py-1 rounded-full
                ${['weight', 'waist', 'chest', 'thigh'].includes(activeMetric)
                  ? evolution.positive ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                  : evolution.positive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                {evolution.positive ? '+' : ''}{evolution.pct}%
              </span>
            )}
          </div>

          {/* Gráfico */}
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="data" tick={{ fill: tickColor, fontSize: 10, fontWeight: 700 }} />
              <YAxis tick={{ fill: tickColor, fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="valor"
                stroke={chartColors[activeMetric]}
                strokeWidth={3}
                dot={{ fill: chartColors[activeMetric], r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Seletor de métrica — grid 3x2 */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {(['weight', 'waist', 'chest', 'biceps', 'thigh', 'calf'] as const).map(metric => (
              <button
                key={metric}
                onClick={() => setActiveMetric(metric)}
                className={`p-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all
                  ${activeMetric === metric
                    ? 'text-white shadow-lg'
                    : `${currentTheme.card} border ${currentTheme.border} ${currentTheme.subtext} hover:opacity-80`
                  }`}
                style={activeMetric === metric ? { backgroundColor: chartColors[metric] } : {}}
              >
                {metricLabels[metric].split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      <EvolutionDashboard currentTheme={currentTheme} />
    </div>
  );
}