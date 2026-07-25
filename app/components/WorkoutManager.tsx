import { useState, useEffect, useCallback } from 'react';
import {
  Dumbbell,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  Save,
  Clock,
  Activity,
  Moon,
  Brain,
  MessageSquare
} from 'lucide-react';
import {
  initialWorkouts,
  getTotalSets,
  type Workout,
  type Exercise,
  type EquipmentType,
} from '../data/workoutData';
import type { Theme } from '../types/themes';
import { supabase } from '../lib/supabase';

interface WorkoutManagerProps {
  currentTheme: Theme;
}

interface SetRecord {
  weight: string;
  reps: string;
  duration_minutes?: number;
  zone_2_minutes?: number;
  completed?: boolean;
}

interface ExerciseRecord {
  equipment: EquipmentType;
  sets: SetRecord[];
}

type WorkoutRecords = Record<string, ExerciseRecord>;

export function WorkoutManager({ currentTheme }: WorkoutManagerProps) {
  const [activeWorkoutId, setActiveWorkoutId] = useState<string>(initialWorkouts[0]?.id ?? '');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [records, setRecords] = useState<WorkoutRecords>({});
  const [loading, setLoading] = useState(false);

  // Estados de Contexto (Opcionais)
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [readiness, setReadiness] = useState<number>(3);
  const [sessionRpe, setSessionRpe] = useState<number>(5);
  const [notes, setNotes] = useState('');

  const activeWorkout = initialWorkouts.find((w) => w.id === activeWorkoutId) || initialWorkouts[0];
  const isLight = currentTheme.id === 'light';

  // --- 1. GESTÃO DE SESSÃO NO SUPABASE ---
  const initSession = useCallback(async (workoutId: string) => {
    setLoading(true);
    try {
      // Busca sessão aberta do mesmo treino nas últimas 12h
      const { data: existing } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('workout_id', workoutId)
        .is('completed_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        setSessionId(existing.id);
        // Carregar séries já salvas
        const { data: savedRecords } = await supabase
          .from('exercise_records')
          .select('*')
          .eq('session_id', existing.id);

        if (savedRecords) {
          const newRecords: WorkoutRecords = {};
          savedRecords.forEach(rec => {
            if (!newRecords[rec.exercise_id]) {
              newRecords[rec.exercise_id] = { equipment: rec.equipment as EquipmentType, sets: [] };
            }
            newRecords[rec.exercise_id].sets[rec.set_index - 1] = {
              weight: rec.weight || '',
              reps: rec.reps || '',
              duration_minutes: rec.duration_minutes,
              zone_2_minutes: rec.zone_2_minutes,
              completed: true
            };
          });
          setRecords(newRecords);
        }
      } else {
        // Cria nova sessão
        const { data: newSession, error } = await supabase
          .from('workout_sessions')
          .insert([{ workout_id: workoutId, performed_at: new Date().toISOString() }])
          .select()
          .single();

        if (error) throw error;
        setSessionId(newSession.id);
        setRecords({}); // Limpa local para novo treino
      }
    } catch (err) {
      console.error("Erro ao iniciar sessão:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initSession(activeWorkoutId);
  }, [activeWorkoutId, initSession]);

  // --- 2. PERSISTÊNCIA EM TEMPO REAL ---
  async function upsertSet(exercise: Exercise, setIndex: number, data: SetRecord) {
    if (!sessionId) return;

    const record = {
      session_id: sessionId,
      exercise_id: exercise.id,
      set_index: setIndex + 1,
      equipment: records[exercise.id]?.equipment || exercise.defaultEquipment,
      weight: data.weight,
      reps: data.reps,
      duration_minutes: data.duration_minutes || null,
      zone_2_minutes: data.zone_2_minutes || null
    };

    const { error } = await supabase
      .from('exercise_records')
      .upsert(record, { onConflict: 'session_id,exercise_id,set_index' });

    if (error) console.error("Erro ao salvar série:", error);
  }

  function handleSetChange(exercise: Exercise, index: number, field: keyof SetRecord, value: string | number) {
    const currentEx = records[exercise.id] || {
      equipment: exercise.defaultEquipment,
      sets: Array.from({ length: exercise.sets }, () => ({ weight: '', reps: '' }))
    };

    const updatedSets = [...currentEx.sets];
    updatedSets[index] = { ...updatedSets[index], [field]: value };

    setRecords(prev => ({ ...prev, [exercise.id]: { ...currentEx, sets: updatedSets } }));
  }

  // --- 3. FINALIZAÇÃO ---
  async function handleFinishWorkout() {
    if (!sessionId) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('workout_sessions')
        .update({
          completed_at: new Date().toISOString(),
          sleep_quality: sleepQuality,
          pre_workout_readiness: readiness,
          session_rpe: sessionRpe,
          notes: notes,
          actual_duration_minutes: 60 // Idealmente calculado por timer futuramente
        })
        .eq('id', sessionId);

      if (error) throw error;
      alert('Sessão finalizada e consolidada no histórico! ⚔️');
      setSessionId(null);
      setRecords({});
      window.location.reload(); // Reset simples
    } catch (err) {
      alert('Erro ao finalizar sessão.');
    } finally {
      setLoading(false);
    }
  }

  const getExerciseRecord = (exercise: Exercise): ExerciseRecord => {
    const saved = records[exercise.id];
    if (saved) {
      // Garante que o número de sets sempre bate com o workoutData
      // Preenche sets faltantes caso o banco tenha retornado menos séries
      const sets = Array.from({ length: exercise.sets }, (_, i) =>
        saved.sets[i] ?? { weight: '', reps: '' }
      );
      return { equipment: saved.equipment, sets };
    }
    return {
      equipment: exercise.defaultEquipment,
      sets: Array.from({ length: exercise.sets }, () => ({ weight: '', reps: '' })),
    };
  };

  if (loading && !sessionId) return <div className="text-center p-10 font-bold">Carregando Protocolo Ares...</div>;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-20">

      {/* SELETOR DE TREINO */}
      <div className="flex flex-wrap gap-2 justify-center">
        {initialWorkouts.map((w) => (
          <button
            key={w.id}
            onClick={() => setActiveWorkoutId(w.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
              activeWorkoutId === w.id
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
                : `${currentTheme.card} ${currentTheme.border} ${currentTheme.subtext}`
            }`}
          >
            {w.id}
          </button>
        ))}
      </div>

      <div className={`rounded-3xl p-6 border shadow-xl ${currentTheme.card} ${currentTheme.border}`}>

        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className={`text-2xl font-black italic uppercase ${currentTheme.text}`}>{activeWorkout.title}</h2>
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 font-bold uppercase tracking-wider">
                {activeWorkout.category === 'strength' ? 'Força' : 'Cardio'}
              </span>
              <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${currentTheme.subtext} border ${currentTheme.border}`}>
                {activeWorkout.duration} Estimado
              </span>
            </div>
          </div>
          <Dumbbell className="text-emerald-500" size={32} />
        </div>

        {/* LISTA DE EXERCÍCIOS */}
        <div className="space-y-4">
          {activeWorkout.exercises.map((exercise) => {
            const isExpanded = expandedExerciseId === exercise.id;
            const record = getExerciseRecord(exercise);
            const isLISS = activeWorkout.id === 'LISS' || exercise.name.includes('LISS');

            return (
              <div key={exercise.id} className={`rounded-2xl border overflow-hidden ${isExpanded ? 'border-emerald-500/50' : currentTheme.border}`}>
                <button
                  onClick={() => setExpandedExerciseId(isExpanded ? null : exercise.id)}
                  className={`w-full p-4 flex items-center justify-between ${isLight ? 'bg-slate-50' : 'bg-slate-900/40'}`}
                >
                  <div className="flex gap-3 items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isExpanded ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'}`}>
                      {exercise.sets}x
                    </div>
                    <div className="text-left">
                      <h3 className={`font-bold text-sm ${currentTheme.text}`}>{exercise.name}</h3>
                      <p className={`text-[10px] uppercase tracking-tighter ${currentTheme.subtext}`}>{exercise.reps} • {exercise.notes}</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {isExpanded && (
                  <div className="p-4 space-y-4 border-t border-slate-700/50">
                    {record.sets.map((set, idx) => (
                      <div key={idx} className="grid grid-cols-4 gap-2 items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase">Série {idx + 1}</span>

                        {!isLISS ? (
                          <>
                            <input
                              type="number"
                              placeholder="Carga"
                              value={set.weight}
                              onChange={(e) => handleSetChange(exercise, idx, 'weight', e.target.value)}
                              onBlur={() => upsertSet(exercise, idx, set)}
                              className={`p-2 rounded-lg text-center text-xs border ${isLight ? 'bg-white' : 'bg-slate-800 border-slate-700 text-white'}`}
                            />
                            <input
                              type="text"
                              placeholder="Reps"
                              value={set.reps}
                              onChange={(e) => handleSetChange(exercise, idx, 'reps', e.target.value)}
                              onBlur={() => upsertSet(exercise, idx, set)}
                              className={`p-2 rounded-lg text-center text-xs border ${isLight ? 'bg-white' : 'bg-slate-800 border-slate-700 text-white'}`}
                            />
                          </>
                        ) : (
                          <>
                            <input
                              type="number"
                              placeholder="Min Totais"
                              value={set.duration_minutes || ''}
                              onChange={(e) => handleSetChange(exercise, idx, 'duration_minutes', parseInt(e.target.value))}
                              onBlur={() => upsertSet(exercise, idx, set)}
                              className="p-2 rounded-lg text-center text-xs bg-slate-800 border-slate-700 text-white"
                            />
                            <input
                              type="number"
                              placeholder="Min Zona 2"
                              value={set.zone_2_minutes || ''}
                              onChange={(e) => handleSetChange(exercise, idx, 'zone_2_minutes', parseInt(e.target.value))}
                              onBlur={() => upsertSet(exercise, idx, set)}
                              className="p-2 rounded-lg text-center text-xs bg-slate-800 border-slate-700 text-white border-emerald-500/30"
                            />
                          </>
                        )}
                        <div className="flex justify-end">
                           <CheckCircle2 size={16} className={set.weight || set.duration_minutes ? 'text-emerald-500' : 'text-slate-600'} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* MÉTRIQUES DE PERFORMANCE ( CONTEXTO ) */}
        <div className={`mt-8 p-4 rounded-2xl border ${currentTheme.border} ${isLight ? 'bg-slate-50' : 'bg-slate-900/20'}`}>
          <h4 className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${currentTheme.text}`}>
            <Activity size={14} className="text-emerald-500" />
            Contexto da Sessão
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Moon size={10} /> Qualidade do Sono (1-5)
              </label>
              <input type="range" min="1" max="5" value={sleepQuality} onChange={(e) => setSleepQuality(parseInt(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-emerald-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Brain size={10} /> Disposição (1-5)
              </label>
              <input type="range" min="1" max="5" value={readiness} onChange={(e) => setReadiness(parseInt(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-emerald-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Clock size={10} /> Esforço da Sessão (1-10)
              </label>
              <input type="range" min="1" max="10" value={sessionRpe} onChange={(e) => setSessionRpe(parseInt(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-emerald-500" />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
              <MessageSquare size={10} /> Observações Contextuais
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Dormi pouco, usei banco inclinado diferente..."
              className={`w-full p-2 text-xs rounded-lg border outline-none h-16 ${isLight ? 'bg-white' : 'bg-slate-800 border-slate-700 text-white'}`}
            />
          </div>
        </div>

        {/* BOTÃO FINALIZAR */}
        <button
          onClick={handleFinishWorkout}
          disabled={loading}
          className="w-full mt-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RotateCcw size={18} />
          {loading ? 'Sinalizando Ares...' : 'Finalizar e Consolidar'}
        </button>
      </div>

      <p className={`text-center text-[10px] uppercase font-bold tracking-widest ${currentTheme.subtext}`}>
        Os dados são salvos em tempo real na nuvem do Protocolo Ares.
      </p>
    </div>
  );
}