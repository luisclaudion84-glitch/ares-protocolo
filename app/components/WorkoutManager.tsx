import { useState } from 'react';
import {
  Dumbbell,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  Save,
} from 'lucide-react';
import {
  initialWorkouts,
  type Workout,
  type Exercise,
  type EquipmentType,
} from '../data/workoutData';
import type { Theme } from '../types/themes';
import { supabase } from '../lib/supabase.ts';
import { saveProfile, loadProfile } from '../lib/profileStorage';

interface WorkoutManagerProps {
  currentTheme: Theme;
}

interface SetRecord {
  weight: string;
  reps: string;
}

interface ExerciseRecord {
  equipment: EquipmentType;
  sets: SetRecord[];
}

type WorkoutRecords = Record<string, ExerciseRecord>;

function createEmptySets(setCount: number): SetRecord[] {
  return Array.from({ length: setCount }, () => ({ weight: '', reps: '' }));
}

export function WorkoutManager({ currentTheme }: WorkoutManagerProps) {
  const [workouts] = useState<Workout[]>(initialWorkouts);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string>(initialWorkouts[0]?.id ?? '');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [records, setRecords] = useState<WorkoutRecords>({});
  const [workoutTime, setWorkoutTime] = useState<string>(() => loadProfile()?.workoutTime ?? '');

  const activeWorkout = workouts.find((w) => w.id === activeWorkoutId) ?? workouts[0];
  const isLight = currentTheme.id === 'light';

  function handleWorkoutTimeChange(time: string) {
    setWorkoutTime(time);
    const profile = loadProfile();
    if (profile) saveProfile({ ...profile, workoutTime: time });
  }

  function getExerciseRecord(exercise: Exercise): ExerciseRecord {
    return records[exercise.id] ?? {
      equipment: exercise.defaultEquipment,
      sets: createEmptySets(exercise.sets),
    };
  }

  function handleWorkoutChange(workoutId: string) {
    setActiveWorkoutId(workoutId);
    setExpandedExerciseId(null);
  }

  function toggleExercise(exerciseId: string) {
    setExpandedExerciseId((prev) => (prev === exerciseId ? null : exerciseId));
  }

  function handleEquipmentChange(exercise: Exercise, equipment: EquipmentType) {
    const current = getExerciseRecord(exercise);
    setRecords((prev) => ({ ...prev, [exercise.id]: { ...current, equipment } }));
  }

  function handleSetChange(exercise: Exercise, setIndex: number, field: 'weight' | 'reps', value: string) {
    const current = getExerciseRecord(exercise);
    const updatedSets = [...current.sets];
    updatedSets[setIndex] = { ...updatedSets[setIndex], [field]: value };
    setRecords((prev) => ({ ...prev, [exercise.id]: { ...current, sets: updatedSets } }));
  }

  function clearExerciseRecord(exercise: Exercise) {
    setRecords((prev) => ({
      ...prev,
      [exercise.id]: { equipment: exercise.defaultEquipment, sets: createEmptySets(exercise.sets) },
    }));
  }

  function isSetComplete(set: SetRecord) {
    return set.weight.trim() !== '' && set.reps.trim() !== '';
  }

  function countCompletedSets(exercise: Exercise) {
    return getExerciseRecord(exercise).sets.filter(isSetComplete).length;
  }

  async function handleFinishWorkout() {
    try {
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert([{ workout_id: activeWorkout.id, duration: activeWorkout.duration }])
        .select()
        .single();

      if (sessionError) throw sessionError;

      const recordsToSave = Object.entries(records).flatMap(([exId, exRecord]) =>
        exRecord.sets
          .filter((set) => set.weight.trim() !== '' || set.reps.trim() !== '')
          .map((set, index) => ({
            session_id: session.id,
            exercise_id: exId,
            equipment: exRecord.equipment,
            weight: set.weight,
            reps: set.reps,
            set_index: index + 1,
          }))
      );

      if (recordsToSave.length > 0) {
        const { error: recordsError } = await supabase.from('exercise_records').insert(recordsToSave);
        if (recordsError) throw recordsError;
      }

      alert('Treino do Protocolo Ares salvo com sucesso na nuvem! ⚔️');
      setRecords({});
      setExpandedExerciseId(null);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Falha ao salvar no banco. Verifique o console.');
    }
  }

  if (!activeWorkout) return null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">

      {/* SELETOR DE TREINO */}
      <div className="flex flex-wrap gap-2 justify-center">
        {workouts.map((workout) => {
          const isActive = activeWorkoutId === workout.id;
          return (
            <button
              key={workout.id}
              onClick={() => handleWorkoutChange(workout.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                isActive
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
                  : `${currentTheme.card} ${currentTheme.border} ${currentTheme.subtext} hover:scale-105`
              }`}
            >
              {workout.id}
            </button>
          );
        })}
      </div>

      {/* CARD PRINCIPAL */}
      <div className={`rounded-3xl p-6 border shadow-xl transition-all ${currentTheme.card} ${currentTheme.border}`}>

        {/* CABEÇALHO */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="space-y-2 flex-1">

            <div>
              <h2 className={`text-2xl font-black italic uppercase ${currentTheme.text}`}>
                {activeWorkout.title}
              </h2>
              <p className={`text-xs font-medium uppercase tracking-widest ${currentTheme.subtext}`}>
                {activeWorkout.focus}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`text-[11px] px-3 py-1 rounded-full border ${currentTheme.border} ${currentTheme.subtext}`}>
                Duração: {activeWorkout.duration}
              </span>
              <span className={`text-[11px] px-3 py-1 rounded-full border ${currentTheme.border} ${currentTheme.subtext}`}>
                {activeWorkout.totalSets > 0 ? `${activeWorkout.totalSets} séries totais` : 'Sessão cardiovascular'}
              </span>
            </div>

            {/* ⏰ HORÁRIO DE TREINO */}
            <div className={`mt-3 flex items-center gap-3 p-3 rounded-xl border ${currentTheme.border} ${isLight ? 'bg-slate-50' : 'bg-slate-900/40'}`}>
              <div className="flex-1">
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${currentTheme.subtext}`}>
                  Horário do Treino
                </p>
                <input
                  type="time"
                  value={workoutTime}
                  onChange={(e) => handleWorkoutTimeChange(e.target.value)}
                  className={`w-full text-sm px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
              </div>
              <div className="flex-1">
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${currentTheme.subtext}`}>
                  Salvo
                </p>
                <p className={`text-sm font-black ${workoutTime ? 'text-emerald-400' : currentTheme.subtext}`}>
                  {workoutTime || '--:--'}
                </p>
              </div>
            </div>

          </div>

          <Dumbbell className="text-emerald-500 shrink-0" size={30} />
        </div>

        {/* LISTA DE EXERCÍCIOS */}
        <div className="space-y-4">
          {activeWorkout.exercises.map((exercise) => {
            const isExpanded = expandedExerciseId === exercise.id;
            const record = getExerciseRecord(exercise);
            const completedSets = countCompletedSets(exercise);

            return (
              <div
                key={exercise.id}
                className={`rounded-2xl border overflow-hidden transition-all ${
                  isExpanded ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : currentTheme.border
                }`}
              >
                {/* HEADER DO EXERCÍCIO */}
                <button
                  type="button"
                  onClick={() => toggleExercise(exercise.id)}
                  className={`w-full p-4 text-left flex items-center justify-between ${isLight ? 'bg-slate-50' : 'bg-slate-900/40'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`min-w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                      isExpanded ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {exercise.sets}x
                    </div>
                    <div className="space-y-1">
                      <h3 className={`font-bold leading-tight ${currentTheme.text}`}>{exercise.name}</h3>
                      <p className={`text-[11px] uppercase tracking-wide ${currentTheme.subtext}`}>
                        {activeWorkout.id !== 'LISS' && `${exercise.defaultEquipment} · `}{exercise.reps}
                      </p>
                      <p className={`text-xs ${currentTheme.subtext}`}>{exercise.notes}</p>
                      <p className="text-[11px] font-semibold text-emerald-500">
                        {completedSets}/{exercise.sets} séries preenchidas
                      </p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} className={currentTheme.subtext} /> : <ChevronDown size={20} className={currentTheme.subtext} />}
                </button>

                {/* CORPO DO EXERCÍCIO */}
                {isExpanded && (
                  <div className={`p-4 space-y-4 border-t ${currentTheme.border} ${isLight ? 'bg-white' : 'bg-slate-900/60'}`}>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      {activeWorkout.id !== 'LISS' ? (
                        <div className="space-y-1">
                          <p className={`text-[11px] font-bold uppercase ${currentTheme.subtext}`}>Equipamento utilizado</p>
                          <select
                            value={record.equipment}
                            onChange={(e) => handleEquipmentChange(exercise, e.target.value as EquipmentType)}
                            className={`text-sm px-3 py-2 rounded-xl border ${
                              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                            }`}
                          >
                            <option value="Máquina">Máquina</option>
                            <option value="Halteres">Halteres</option>
                            <option value="Barra">Barra</option>
                            <option value="Polia">Polia</option>
                            <option value="Peso Corporal">Peso Corporal</option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <p className="text-xs font-bold text-emerald-500 uppercase">Sessão de Cardio</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => clearExerciseRecord(exercise)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${currentTheme.border} ${currentTheme.subtext} hover:text-red-400 hover:border-red-400/40`}
                        >
                          Limpar
                        </button>
                        <button
                          type="button"
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-2"
                        >
                          <Save size={14} />
                          Salvar
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className={`grid ${activeWorkout.id === 'LISS' ? 'grid-cols-3' : 'grid-cols-4'} gap-2 px-2 text-[10px] font-bold uppercase text-slate-500`}>
                        <span>Série</span>
                        {activeWorkout.id !== 'LISS' && <span>Carga</span>}
                        <span>Reps / Tempo</span>
                        <span className="text-right">Status</span>
                      </div>

                      {record.sets.map((set, index) => (
                        <div
                          key={`${exercise.id}-set-${index}`}
                          className={`grid ${activeWorkout.id === 'LISS' ? 'grid-cols-3' : 'grid-cols-4'} gap-2 items-center p-2 rounded-xl ${isLight ? 'bg-slate-50' : 'bg-black/10'}`}
                        >
                          <span className={`text-sm font-mono font-bold ${currentTheme.subtext}`}>#{index + 1}</span>

                          {activeWorkout.id !== 'LISS' && (
                            <input
                              type="number"
                              inputMode="decimal"
                              placeholder="0"
                              value={set.weight}
                              onChange={(e) => handleSetChange(exercise, index, 'weight', e.target.value)}
                              className={`w-full p-2 text-center rounded-lg border text-sm ${
                                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                              }`}
                            />
                          )}

                          <input
                            type="text"
                            placeholder={exercise.reps}
                            value={set.reps}
                            onChange={(e) => handleSetChange(exercise, index, 'reps', e.target.value)}
                            className={`w-full p-2 text-center rounded-lg border text-sm ${
                              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                            }`}
                          />

                          <div className="flex justify-end">
                            <CheckCircle2
                              size={18}
                              className={
                                (activeWorkout.id === 'LISS' ? set.reps.trim() !== '' : isSetComplete(set))
                                  ? 'text-emerald-500'
                                  : 'text-slate-600'
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* BOTÃO FINALIZAR */}
        <div className="mt-8">
          <button
            type="button"
            onClick={handleFinishWorkout}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed font-bold text-sm transition-all ${currentTheme.border} ${currentTheme.subtext} hover:border-emerald-500/50 hover:text-emerald-500`}
          >
            <RotateCcw size={16} />
            Finalizar sessão
          </button>
        </div>

      </div>
    </div>
  );
}