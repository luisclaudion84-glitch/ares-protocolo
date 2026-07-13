// app/lib/protocolEngine.ts
import type { SavedProfile } from './profileStorage';
import {
  calculateTMB,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
} from './profileStorage';

export interface DailyAdjustments {
  workout: boolean;
  creatine: boolean;
  heat: boolean;
}

export interface WaterScheduleItem {
  time: string;
  amount: number;
  label: string;
  priority: 'high' | 'medium' | 'low';
}

export interface NutritionProtocol {
  tmb: number;
  tdee: number;
  targetCalories: number;
  macros: {
    protein: number;
    fat: number;
    carbs: number;
  };
  strategy: string;
}

export interface AresProtocol {
  hydration: {
    fixedDailyGoal: number;
    recommendedExtra: number;
    schedule: WaterScheduleItem[];
  };
  nutrition: NutritionProtocol;
}

// ─── Texto explicativo da estratégia por objetivo ─────────────────────────────
function buildStrategyText(goal: string, maintenanceIntent?: string): string {
  if (goal === 'loss') {
    return 'Protocolo de déficit calórico moderado (−18% do TDEE), com proteína elevada para preservar massa muscular durante a perda de gordura.';
  }
  if (goal === 'gain') {
    return 'Protocolo de superávit calórico controlado (+12% do TDEE), priorizando proteína para suporte ao ganho de massa muscular.';
  }
  // manutenção
  const intentMap: Record<string, string> = {
    stability:     'Foco em estabilidade de peso e saúde geral. Calorias equilibradas com o gasto estimado.',
    recomposition: 'Foco em recomposição corporal. Calorias de manutenção com proteína elevada para favorecer troca de gordura por músculo.',
    preserve:      'Foco em consolidar resultado alcançado. Protocolo de manutenção para preservar as adaptações obtidas.',
    performance:   'Foco em desempenho e força. Calorias de manutenção com distribuição de macros otimizada para treino.',
  };
  return intentMap[maintenanceIntent ?? ''] ?? 'Protocolo de manutenção calórica com distribuição equilibrada de macronutrientes.';
}

// ─── Motor principal ──────────────────────────────────────────────────────────
export function generateFullProtocol(
  profile: SavedProfile,
  adjustments: DailyAdjustments
): AresProtocol {

  // ── Hidratação (lógica original preservada) ──────────────────────────────
  const weight = profile.weight || 70;
  let fixedGoal = 1500 + (weight - 20) * 20;
  if (profile.activityLevel === 'active') fixedGoal += 500;
  if (profile.goal === 'gain') fixedGoal += 300;

  let extra = 0;
  if (adjustments.workout)  extra += 400;
  if (adjustments.creatine) extra += 300;
  if (adjustments.heat)     extra += 500;

  const phases = [
    { hour: 8,  percent: 0.15, label: 'Reidratação', priority: 'high'   },
    { hour: 10, percent: 0.10, label: 'Fluxo Manhã',  priority: 'medium' },
    { hour: 13, percent: 0.12, label: 'Manutenção',   priority: 'medium' },
    { hour: 15, percent: 0.15, label: 'Fluxo Tarde',  priority: 'high'   },
    { hour: 17, percent: 0.13, label: 'Foco Pré',     priority: 'medium' },
    { hour: 19, percent: 0.15, label: 'Aceleração',   priority: 'high'   },
    { hour: 21, percent: 0.12, label: 'Finalização',  priority: 'medium' },
    { hour: 22, percent: 0.08, label: 'Recolhimento', priority: 'low'    },
  ];

  const schedule: WaterScheduleItem[] = phases.map(phase => {
    const extraWeight = (phase.hour >= 10 && phase.hour <= 19) ? 0.15 : 0.05;
    const baseAmount  = Math.round(fixedGoal * phase.percent);
    const extraAmount = Math.round(extra * extraWeight);
    return {
      time:     `${String(phase.hour).padStart(2, '0')}:00`,
      amount:   baseAmount + extraAmount,
      label:    phase.label,
      priority: phase.priority as 'high' | 'medium' | 'low',
    };
  });

  // ── Nutrição (novo bloco) ────────────────────────────────────────────────
  const tmb            = calculateTMB(profile);
  const tdee           = calculateTDEE(tmb, profile.activityLevel);
  const targetCalories = calculateTargetCalories(tdee, profile.goal);
  const macros         = calculateMacros({ weight, goal: profile.goal, targetCalories });
  const strategy       = buildStrategyText(profile.goal, profile.maintenanceIntent);

  return {
    hydration: {
      fixedDailyGoal:   Math.round(fixedGoal),
      recommendedExtra: Math.round(extra),
      schedule,
    },
    nutrition: {
      tmb,
      tdee,
      targetCalories,
      macros,
      strategy,
    },
  };
}