// app/lib/profileStorage.ts

export interface SavedProfile {
  name: string;
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: string;
  goal: string;
  maintenanceIntent?: 'stability' | 'recomposition' | 'preserve' | 'performance';
  tmb: number;
  tdee: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  workoutTime?: string;
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

// ─── TMB — Mifflin-St Jeor ───────────────────────────────────────────────────
export function calculateTMB(profile: {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
}): number {
  const { weight, height, age, gender } = profile;
  const base = 10 * weight + 6.25 * height - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

// ─── TDEE — TMB × fator de atividade ─────────────────────────────────────────
const ACTIVITY_FACTORS: Record<string, number> = {
  sedentary: 1.2,
  light:     1.375,
  moderate:  1.55,
  active:    1.725,
  athlete:   1.9,
};

export function calculateTDEE(tmb: number, activityLevel: string): number {
  const factor = ACTIVITY_FACTORS[activityLevel] ?? 1.2;
  return Math.round(tmb * factor);
}

// ─── Meta calórica — TDEE ajustado pelo objetivo ─────────────────────────────
export function calculateTargetCalories(tdee: number, goal: string): number {
  if (goal === 'loss')  return Math.round(tdee * 0.82); // déficit de 18%
  if (goal === 'gain')  return Math.round(tdee * 1.12); // superávit de 12%
  return tdee;                                           // manutenção
}

// ─── Macronutrientes — hierarquia fisiológica ─────────────────────────────────
// 1. Proteína: 2.0 g/kg (todos os objetivos na v1)
// 2. Gordura:  25% das calorias da meta
// 3. Carboidrato: calorias restantes ÷ 4
export function calculateMacros(profile: {
  weight: number;
  goal: string;
  targetCalories: number;
}) {
  const { weight, targetCalories } = profile;

  const protein      = Math.round(weight * 2.0);
  const fat          = Math.round((targetCalories * 0.25) / 9);
  const proteinCals  = protein * 4;
  const fatCals      = fat * 9;
  const carbCals     = targetCalories - proteinCals - fatCals;
  const carbs        = Math.max(Math.round(carbCals / 4), 0);

  return { protein, fat, carbs };
}

// ─── Medidas corporais ────────────────────────────────────────────────────────
export interface BodyMeasurement {
  date: string;
  weight: number;
  chest: number;
  waist: number;
  biceps: number;
  thigh: number;
  calf: number;
  origin: 'initial' | 'checkin' | 'manual';
  cycleNumber: number; // 0 = inicial, 1 = primeiro check-in, etc.
}

const MEASUREMENTS_KEY = 'ares_measurements';

export function saveMeasurement(measure: BodyMeasurement): void {
  const history = getMeasurementsHistory();
  // Atualiza se já houver registro da mesma data e origem
  const filtered = history.filter(
    h => !(h.date === measure.date && h.origin === measure.origin)
  );
  localStorage.setItem(MEASUREMENTS_KEY, JSON.stringify([measure, ...filtered]));
}

export function getMeasurementsHistory(): BodyMeasurement[] {
  const data = localStorage.getItem(MEASUREMENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getInitialMeasurement(): BodyMeasurement | null {
  const history = getMeasurementsHistory();
  return history.find(h => h.origin === 'initial') ?? null;
}

export function getLastCheckin(): BodyMeasurement | null {
  const history = getMeasurementsHistory();
  const checkins = history
    .filter(h => h.origin === 'checkin')
    .sort((a, b) => b.cycleNumber - a.cycleNumber);
  return checkins[0] ?? null;
}