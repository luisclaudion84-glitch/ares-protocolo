// app/lib/dietSuggestions.ts

export interface SuggestionMeal {
  name: string;
  items: string[];
}

export function getDietSuggestions(goal: string, targetCalories: number): SuggestionMeal[] {
  // Uma lógica simples de proporção para as refeições
  // Café: 20%, Almoço: 35%, Lanche: 15%, Jantar: 30%
  
  if (goal === 'gain') {
    return [
      { name: 'Café da Manhã', items: ['4 Ovos mexidos', '2 Fatias de pão integral', '1 Banana com aveia'] },
      { name: 'Almoço', items: ['200g Arroz branco', '150g Frango grelhado', '100g Feijão', 'Salada à vontade'] },
      { name: 'Lanche da Tarde', items: ['Iogurte natural', '30g de Whey ou Albumina', '1 Maçã'] },
      { name: 'Jantar', items: ['200g Batata doce', '150g Carne moída (patinho)', 'Brócolis no vapor'] },
    ];
  }

  if (goal === 'loss') {
    return [
      { name: 'Café da Manhã', items: ['2 Ovos mexidos', '1 Fatia de pão integral', 'Meio mamão papaia'] },
      { name: 'Almoço', items: ['120g Arroz', '150g Filé de tilápia ou frango', 'Muita salada verde'] },
      { name: 'Lanche da Tarde', items: ['10 amêndoas', '1 Iogurte desnatado'] },
      { name: 'Jantar', items: ['Vegetais variados', '150g Frango grelhado', '1 Fio de azeite extra virgem'] },
    ];
  }

  // Padrão: Manutenção
  return [
    { name: 'Café da Manhã', items: ['3 Ovos', '2 Fatias de pão', 'Fruta'] },
    { name: 'Almoço', items: ['150g Arroz', '150g Proteína', 'Feijão e Salada'] },
    { name: 'Lanche da Tarde', items: ['Fruta', 'Iogurte ou Mix de castanhas'] },
    { name: 'Jantar', items: ['100g Carboidrato', '150g Proteína', 'Legumes'] },
  ];
}