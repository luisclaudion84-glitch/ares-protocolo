export type EquipmentType = 'Máquina' | 'Halteres' | 'Barra' | 'Polia' | 'Peso Corporal';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  notes: string;
  defaultEquipment: EquipmentType;
}

export interface Workout {
  id: string;
  title: string;
  focus: string;
  duration: string;
  totalSets: number;
  exercises: Exercise[];
}

export const initialWorkouts: Workout[] = [
  {
    id: 'A',
    title: 'Peito + Tríceps (Completo)',
    focus: 'Peito · Tríceps',
    duration: '55-60 min',
    totalSets: 21,
    exercises: [     
      { id: 'a1', name: 'Supino 45º', sets: 4, reps: '8-10', notes: 'Pirâmide crescente · Amplitude total', defaultEquipment: 'Halteres' },
      { id: 'a2', name: 'Supino Reto', sets: 4, reps: '8-10', notes: 'Composto principal', defaultEquipment: 'Máquina' },
      { id: 'a3', name: 'Crucifixo', sets: 4, reps: '08-10', notes: 'Amplitude máxima', defaultEquipment: 'Máquina' },
      { id: 'a4', name: 'CrossOver Polia Alta', sets: 3, reps: '12', notes: 'Pausa na posição cruzada', defaultEquipment: 'Polia' },
      { id: 'a5', name: 'Tríceps Testa (barra EZ)', sets: 3, reps: '10-12', notes: 'Braços elevados · Cabeça longa', defaultEquipment: 'Polia' },
      { id: 'a6', name: 'Tríceps Corda', sets: 3, reps: '12-15', notes: 'Corda', defaultEquipment: 'Polia' },  
      { id: 'a7', name: 'Mergulho Banco', sets: 3, reps: '12-15', notes: 'Tríceps isolado', defaultEquipment: 'Peso Corporal' },
    ]
  },
  {
    id: 'B',
    title: 'Costas + Bíceps (Completo)',
    focus: 'Latíssimo · Bíceps Longo',
    duration: '60-65 min',
    totalSets: 26,
    exercises: [
      { id: 'b1', name: 'Puxada Frontal', sets: 4, reps: '10-12', notes: 'Amplitude total · Pegada pronada', defaultEquipment: 'Polia' },
      { id: 'b2', name: 'Remada Triango Pulley', sets: 4, reps: '10-12', notes: 'Pico de contração', defaultEquipment: 'Polia' },
      { id: 'b3', name: 'Pullover', sets: 4, reps: '12-15', notes: 'Foco no latíssimo', defaultEquipment: 'Halteres' },
      { id: 'b4', name: 'Remada Máquina', sets: 3, reps: '12-15', notes: 'Peito apoiado', defaultEquipment: 'Máquina' },
      { id: 'b5', name: 'Remada Curvada', sets: 4, reps: '8-10', notes: 'Tronco 45º · Barra', defaultEquipment: 'Barra' },
      { id: 'b6', name: 'Rosca Alternadas', sets: 4, reps: '10-12', notes: 'No banco ou Cross', defaultEquipment: 'Barra' },
      { id: 'b7', name: 'Rosca Banco Scott', sets: 3, reps: '12-15', notes: 'Pico de contração', defaultEquipment: 'Halteres' },
    ]
  },
    {
    id: 'C',
    title: 'Ombros + Trapézio (Completo)',
    focus: 'Deltóide Medial · Trapézio Superior',
    duration: '45-50 min',
    totalSets: 17,
    exercises: [
      { id: 'c1', name: 'Desenvolvimento Máquina', sets: 4, reps: '8-10', notes: 'Composto principal', defaultEquipment: 'Halteres' },
      { id: 'c2', name: 'Elevação Lateral', sets: 4, reps: '12-15', notes: 'Cotovelo levemente flexionado', defaultEquipment: 'Halteres' },
      { id: 'c3', name: 'Elevação Frontal', sets: 3, reps: '12', notes: 'Alternado', defaultEquipment: 'Halteres' },
      { id: 'c4', name: 'Cruxifixo inverso', sets: 4, reps: '12', notes: 'Braço levemente dobrado',defaultEquipment: 'Polia'},
      { id: 'c5', name: 'Facepull', sets: 3, reps: '12-15', notes: 'Saúde do manguito', defaultEquipment: 'Polia' },
      { id: 'c6', name: 'Remada alta no Cross', sets: 3, reps: '12-15', notes: 'Saúde do manguito', defaultEquipment: 'Polia' },
      { id: 'c7', name: 'Encolhimento', sets: 3, reps: '12-15', notes: 'Pausa no topo', defaultEquipment: 'Polia' },
          ]
  },   
  {
    id: 'D',
    title: 'Pernas (Quadríceps)',
    focus: 'Dominância de Quadríceps · Agachamento',
    duration: '65-70 min',
    totalSets: 20,
    exercises: [
      { id: 'd1', name: 'Agachamento Livre', sets: 4, reps: '8-10', notes: 'Composto principal', defaultEquipment: 'Barra' },
      { id: 'd2', name: 'Leg Press', sets: 4, reps: '10-12', notes: 'Pés na largura dos ombros', defaultEquipment: 'Máquina' },
      { id: 'd3', name: 'Cadeira Extensora', sets: 3, reps: '12-15', notes: 'Pausa no topo', defaultEquipment: 'Máquina' },
      { id: 'd4', name: 'Mesa Flexora', sets: 4, reps: '10-12', notes: 'Pausa na contração', defaultEquipment: 'Máquina' },
      { id: 'd5', name: 'Stiff (RDL)', sets: 4, reps: '8-10', notes: 'Composto principal', defaultEquipment: 'Barra' },
      { id: 'd6', name: 'Cadeira Adutora', sets: 3, reps: '15', notes: 'Foco no glúteo médio', defaultEquipment: 'Máquina' },
      { id: 'd8', name: 'Panturrilha em Pé', sets: 4, reps: '15-20', notes: 'Amplitude total', defaultEquipment: 'Máquina' },
      { id: 'd9', name: 'Panturrilha Sentado', sets: 2, reps: '20-25', notes: 'Sóleo', defaultEquipment: 'Máquina' },
    ]
  },
    {
    id: 'LISS',
    title: 'Cardio LISS',
    focus: 'Oxidação de Gordura · Zona 2',
    duration: '45-60 min',
    totalSets: 0,
    exercises: [
      { id: 'liss-1', name: 'Esteira', sets: 1, reps: '35-45 min', notes: '60-70% FCMax · ~115 bpm', defaultEquipment: 'Máquina' },
      { id: 'liss-2', name: 'Bicicleta Ergométrica', sets: 1, reps: '35-45 min', notes: 'Alternativa à esteira', defaultEquipment: 'Máquina' },
      { id: 'liss-3', name: 'Caminhada Externa', sets: 1, reps: '35-45 min', notes: 'Terreno plano ou levemente inclinado', defaultEquipment: 'Peso Corporal' },
    ]
  },
];