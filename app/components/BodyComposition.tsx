// app/components/BodyComposition.tsx
import React, { useState } from 'react';
import { Ruler, Save, History, Scale } from 'lucide-react';
import { saveMeasurement } from '../lib/profileStorage';

export function BodyComposition({ currentTheme }: { currentTheme: any }) {
  const [measure, setMeasure] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: 80, chest: 100, waist: 90, biceps: 35, thigh: 60, calf: 40
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveMeasurement(measure);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const InputField = ({ label, value, field }: any) => (
    <div className="space-y-1">
      <span className="text-[10px] font-black uppercase text-gray-500 ml-2">{label}</span>
      <input 
        type="number" 
        className={`w-full p-4 rounded-2xl bg-black/30 border ${currentTheme.border} ${currentTheme.text} outline-none focus:border-emerald-500 text-center font-bold`}
        value={value}
        onChange={(e) => setMeasure({...measure, [field]: Number(e.target.value)})}
      />
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      <div className={`p-8 rounded-3xl border-2 shadow-2xl backdrop-blur-sm ${currentTheme.border} bg-black/10`}>
        
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
            ${saved ? 'bg-green-500' : 'bg-emerald-500 hover:bg-emerald-600'}`}
        >
          {saved ? <><History size={20} /> Medidas Salvas!</> : <><Save size={20} /> Registrar Medidas de Hoje</>}
        </button>
      </div>
    </div>
  );
}