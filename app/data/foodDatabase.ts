// app/data/foodDatabase.ts

export interface FoodItem {
  id: string;
  name: string;
  calories: number; // por 100g ou 100ml
  protein: number;
  carbs: number;
  fat: number;
  category: string;
  unitWeight?: number;
}

export const TACO_DATABASE: FoodItem[] = [
  { id: '1', name: 'Ovo de Galinha Inteiro (Cozido)', category: 'Ovos', calories: 155, protein: 13, carbs: 1, fat: 11, unitWeight: 50 }, // ~50g por ovo
  { id: '2', name: 'Pão Francês', category: 'Panificados', calories: 300, protein: 8, carbs: 58, fat: 3, unitWeight: 50 }, // ~50g por pão
  { id: '3', name: 'Banana Prata', category: 'Frutas', calories: 89, protein: 1, carbs: 23, fat: 0.3, unitWeight: 100 }, // ~100g por banana
  
  // CEREAIS E DERIVADOS
  { id: '1', category: 'Cereais', name: 'Arroz, integral, cozido', calories: 124, protein: 2.6, carbs: 25.8, fat: 1.0 },
  { id: '2', category: 'Cereais', name: 'Arroz, branco, cozido', calories: 128, protein: 2.5, carbs: 28.1, fat: 0.2 },
  { id: '3', category: 'Cereais', name: 'Aveia, em flocos, crua', calories: 394, protein: 13.9, carbs: 66.6, fat: 8.5 },
  { id: '4', category: 'Cereais', name: 'Macarrão, trigo, cozido', calories: 131, protein: 4.6, carbs: 28.3, fat: 0.4 },
  { id: '5', category: 'Cereais', name: 'Milho, verde, cozido', calories: 98, protein: 3.2, carbs: 17.1, fat: 2.4 },
  { id: '6', category: 'Cereais', name: 'Pão, de forma, integral', calories: 253, protein: 9.4, carbs: 49.9, fat: 3.7 },
  { id: '7', category: 'Cereais', name: 'Pão, francês', calories: 300, protein: 8.0, carbs: 58.6, fat: 3.1 },
  { id: '8', category: 'Cereais', name: 'Tapioca, goma', calories: 241, protein: 0.2, carbs: 60.1, fat: 0.0 },
  { id: '9', category: 'Cereais', name: 'Cuscuz, de milho, cozido', calories: 113, protein: 2.3, carbs: 25.4, fat: 0.6 },

  // LEGUMINOSAS
  { id: '100', category: 'Leguminosas', name: 'Feijão, carioca, cozido', calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5 },
  { id: '101', category: 'Leguminosas', name: 'Feijão, preto, cozido', calories: 77, protein: 4.5, carbs: 14.0, fat: 0.5 },
  { id: '102', category: 'Leguminosas', name: 'Grão-de-bico, cozido', calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6 },
  { id: '103', category: 'Leguminosas', name: 'Lentilha, cozida', calories: 116, protein: 9.0, carbs: 20.1, fat: 0.4 },
  { id: '104', category: 'Leguminosas', name: 'Ervilha, enlatada, escorrida', calories: 74, protein: 4.7, carbs: 13.4, fat: 0.4 },

  // CARNES, PEIXES E OVOS
  { id: '200', category: 'Carnes', name: 'Carne, patinho, grelhado', calories: 219, protein: 35.9, carbs: 0, fat: 7.3 },
  { id: '201', category: 'Carnes', name: 'Carne, maminha, grelhada', calories: 153, protein: 30.7, carbs: 0, fat: 2.4 },
  { id: '202', category: 'Carnes', name: 'Carne, moída (acém), refogada', calories: 212, protein: 26.7, carbs: 0, fat: 10.9 },
  { id: '203', category: 'Carnes', name: 'Frango, peito, grelhado', calories: 159, protein: 32.0, carbs: 0, fat: 2.5 },
  { id: '204', category: 'Carnes', name: 'Frango, sobrecoxa, assada', calories: 233, protein: 28.7, carbs: 0, fat: 12.1 },
  { id: '205', category: 'Carnes', name: 'Frango, coração, grelhado', calories: 207, protein: 20.1, carbs: 0.9, fat: 13.6 },
  { id: '206', category: 'Carnes', name: 'Ovo, de galinha, cozido', calories: 155, protein: 13.3, carbs: 0.6, fat: 10.6 },
  { id: '207', category: 'Carnes', name: 'Ovo, de galinha, frito', calories: 240, protein: 15.6, carbs: 1.2, fat: 18.6 },
  { id: '208', category: 'Carnes', name: 'Tilápia, filé, assado', calories: 111, protein: 24.3, carbs: 0, fat: 0.9 },
  { id: '209', category: 'Carnes', name: 'Salmão, filé, grelhado', calories: 229, protein: 25.4, carbs: 0, fat: 13.4 },
  { id: '210', category: 'Carnes', name: 'Atum, em conserva, em óleo', calories: 285, protein: 26.2, carbs: 0, fat: 20.1 },

  // LATICÍNIOS
  { id: '400', category: 'Laticínios', name: 'Leite, integral', calories: 60, protein: 3.2, carbs: 4.7, fat: 3.3 },
  { id: '401', category: 'Laticínios', name: 'Leite, desnatado', calories: 35, protein: 3.3, carbs: 4.8, fat: 0.2 },
  { id: '402', category: 'Laticínios', name: 'Iogurte, natural', calories: 51, protein: 4.1, carbs: 5.0, fat: 1.7 },
  { id: '403', category: 'Laticínios', name: 'Queijo, mussarela', calories: 280, protein: 22.6, carbs: 3.0, fat: 19.6 },
  { id: '404', category: 'Laticínios', name: 'Queijo, minas frescal', calories: 264, protein: 17.4, carbs: 3.2, fat: 20.2 },
  { id: '405', category: 'Laticínios', name: 'Requeijão, cremoso', calories: 257, protein: 9.6, carbs: 3.5, fat: 22.7 },
  { id: '406', category: 'Laticínios', name: 'Whey Protein (concentrado)', calories: 395, protein: 80.0, carbs: 6.0, fat: 5.0 },

  // FRUTAS
  { id: '300', category: 'Frutas', name: 'Abacate, cru', calories: 96, protein: 1.2, carbs: 6.0, fat: 8.4 },
  { id: '301', category: 'Frutas', name: 'Banana, nanica, crua', calories: 92, protein: 1.4, carbs: 23.8, fat: 0.1 },
  { id: '302', category: 'Frutas', name: 'Banana, prata, crua', calories: 89, protein: 1.3, carbs: 23.0, fat: 0.1 },
  { id: '303', category: 'Frutas', name: 'Maçã, gala, com casca', calories: 63, protein: 0.3, carbs: 15.4, fat: 0.3 },
  { id: '304', category: 'Frutas', name: 'Mamão, papaia, cru', calories: 40, protein: 0.5, carbs: 10.4, fat: 0.1 },
  { id: '305', category: 'Frutas', name: 'Manga, palmer, crua', calories: 72, protein: 0.4, carbs: 19.4, fat: 0.2 },
  { id: '306', category: 'Frutas', name: 'Melancia, crua', calories: 33, protein: 0.9, carbs: 8.1, fat: 0.4 },
  { id: '307', category: 'Frutas', name: 'Uva, itália, crua', calories: 68, protein: 0.6, carbs: 17.3, fat: 0.2 },
  { id: '308', category: 'Frutas', name: 'Morango, cru', calories: 30, protein: 0.9, carbs: 6.8, fat: 0.3 },

  // VERDURAS E LEGUMES
  { id: '500', category: 'Legumes', name: 'Alface, americana, crua', calories: 9, protein: 0.6, carbs: 1.7, fat: 0.1 },
  { id: '501', category: 'Legumes', name: 'Brócolis, cozido', calories: 25, protein: 2.1, carbs: 4.4, fat: 0.5 },
  { id: '502', category: 'Legumes', name: 'Cenoura, crua', calories: 34, protein: 1.3, carbs: 7.7, fat: 0.2 },
  { id: '503', category: 'Legumes', name: 'Tomate, salada, cru', calories: 15, protein: 1.1, carbs: 3.1, fat: 0.2 },
  { id: '504', category: 'Legumes', name: 'Batata-doce, cozida', calories: 77, protein: 0.6, carbs: 18.4, fat: 0.1 },
  { id: '505', category: 'Legumes', name: 'Batata, inglesa, cozida', calories: 52, protein: 1.2, carbs: 11.9, fat: 0.0 },
];