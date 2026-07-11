import { Droplets, Dumbbell, Utensils, TrendingUp, Sun, Moon, LayoutDashboard } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, darkMode, setDarkMode }: SidebarProps) {
  const menuItems = [
    { id: 'dash', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'water', label: 'Água', icon: Droplets },
    { id: 'nutri', label: 'Nutrição', icon: Utensils },
    { id: 'treino', label: 'Treino', icon: Dumbbell },
    { id: 'evolucao', label: 'Evolução', icon: TrendingUp },
  ];

  return (
    <aside className={`w-64 h-screen fixed left-0 top-0 border-r transition-colors duration-500 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
      <div className="p-6">
        <h1 className={`text-2xl font-black italic tracking-tighter ${darkMode ? 'text-blue-500' : 'text-blue-700'}`}>
          Protocolo Ares
        </h1>
      </div>

      <nav className="mt-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === item.id
                ? (darkMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-blue-600 text-white shadow-lg')
                : (darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600')
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="absolute bottom-6 left-0 w-full px-6">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
            darkMode ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200 shadow-sm'
          }`}
        >
          {darkMode ? <><Sun size={18} /> Modo Claro</> : <><Moon size={18} /> Modo Escuro</>}
        </button>
      </div>
    </aside>
  );
}