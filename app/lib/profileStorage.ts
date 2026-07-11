// app/lib/profileStorage.ts

export interface SavedProfile {
  name: string;
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: string;
  goal: string;
  tmb: number;
  tdee: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  workoutTime ?: string;
}

const PROFILE_KEY = 'ares_profile';

export function saveProfile(profile: SavedProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadProfile(): SavedProfile | null {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
}

// Cálculo dos macronutrientes baseado no objetivo
export function calculateMacros(profile: {
  weight: number;
  goal: string;
  targetCalories: number;
}) {
  const { weight, goal, targetCalories } = profile;

  let proteinPerKg = 1.8;
  if (goal === 'gain') proteinPerKg = 2.2;
  if (goal === 'loss') proteinPerKg = 2.0;

  const protein = Math.round(weight * proteinPerKg);
  const fat = Math.round(weight * 0.8);
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const carbCalories = targetCalories - proteinCalories - fatCalories;
  const carbs = Math.round(carbCalories / 4);

  return { protein, carbs: Math.max(carbs, 0), fat };
}
// app/lib/profileStorage.ts (Adicionar ao final do arquivo)

export interface BodyMeasurement {
  date: string;
  weight: number;
  chest: number;
  waist: number;
  biceps: number;
  thigh: number;
  calf: number;
}

const MEASUREMENTS_KEY = 'ares_measurements';

export function saveMeasurement(measure: BodyMeasurement): void {
  const history = getMeasurementsHistory();
  // Garante que não duplique a data, se já existir hoje, ele atualiza
  const filtered = history.filter(h => h.date !== measure.date);
  localStorage.setItem(MEASUREMENTS_KEY, JSON.stringify([measure, ...filtered]));
}

export function getMeasurementsHistory(): BodyMeasurement[] {
  const data = localStorage.getItem(MEASUREMENTS_KEY);
  return data ? JSON.parse(data) : [];
}