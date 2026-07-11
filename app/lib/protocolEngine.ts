// app/lib/protocolEngine.ts
import type { SavedProfile } from './profileStorage';

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

export interface AresProtocol {
  hydration: {
    fixedDailyGoal: number;      // A meta do cadastro
    recommendedExtra: number;    // O adicional por clima/treino/creatina
    schedule: WaterScheduleItem[];
  };
}

export function generateFullProtocol(
  profile: SavedProfile,
  adjustments: DailyAdjustments
): AresProtocol {
  // 1. Meta Fixa (Baseada no perfil clínico)
  const weight = profile.weight || 70;
  let fixedGoal = 1500 + (weight - 20) * 20; // Regra básica clínica direta
  if (profile.activityLevel === 'active') fixedGoal += 500;
  if (profile.goal === 'gain') fixedGoal += 300;

  // 2. Recomendação Extra (Variáveis do dia)
  let extra = 0;
  if (adjustments.workout) extra += 400;  // Sugestão fixa p/ treino
  if (adjustments.creatine) extra += 300; // Sugestão p/ creatina
  if (adjustments.heat) extra += 500;     // Sugestão p/ calor

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
    const baseAmount = Math.round(fixedGoal * phase.percent);
    const extraAmount = Math.round(extra * extraWeight);
    return {
      time: `${String(phase.hour).padStart(2, '0')}:00`,
      amount: baseAmount + extraAmount,
      label: phase.label,
      priority: phase.priority as 'high' | 'medium' | 'low',
    };
  });
  
  return {
    hydration: {
      fixedDailyGoal: Math.round(fixedGoal),
      recommendedExtra: Math.round(extra),
      schedule
    }
  };
}