import { useState } from 'react';
import { Swords, Palette, Sun, Moon, X, LayoutDashboard, Droplets, Utensils, Dumbbell, TrendingUp, LogOut } from 'lucide-react';
import { themes, type Theme } from '../types/themes';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  onLogout: () => void; //
}

export function Navbar({ activeTab, setActiveTab, currentTheme, setTheme, onLogout }: NavbarProps) {
  const [showThemes, setShowThemes] = useState(false);

  const menuItems = [
    { id: 'dash', label: 'Início', icon: LayoutDashboard },
    { id: 'water', label: 'Água', icon: Droplets },
    { id: 'nutri', label: 'Nutrição', icon: Utensils },
    { id: 'treino', label: 'Treino', icon: Dumbbell },
    { id: 'evolucao', label: 'Evolução', icon: TrendingUp },
  ];

  const isDark = currentTheme.id !== 'light';

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 border-b transition-colors duration-500 ${currentTheme.nav}`}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-emerald-500/20 p-1.5 rounded-lg">
              <Swords className="text-emerald-400" size={20} />
            </div>
            <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">
  <span className={`${currentTheme.id === 'light' ? 'text-slate-800' : 'text-white'} border-b-2 border-emerald-400 pb-0.5`}>
    Protocolo
  </span>
  <span className="text-emerald-400 ml-1">Ares</span>
</h1>
          </div>

          {/* Menu Items */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === item.id
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : `${currentTheme.subtext} hover:bg-white/10`
                }`}
              >
                <item.icon size={16} />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Botões Tema e Dark/Light */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowThemes(!showThemes)}
              className={`p-2 rounded-lg transition-all ${currentTheme.subtext} hover:bg-white/10`}
              title="Temas"
            >
              <Palette size={18} />
            </button>
            <button
              onClick={() => setTheme(isDark ? themes.find(t => t.id === 'light')! : themes.find(t => t.id === 'dark')!)}
              className={`p-2 rounded-lg transition-all ${currentTheme.subtext} hover:bg-white/10`}
              title="Modo Claro/Escuro"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
  onClick={onLogout}
  className={`p-2 rounded-lg transition-all text-red-400 hover:bg-red-500/20`}
  title="Sair"
>
  <LogOut size={18} />
</button>
          </div>

        </div>
      </nav>

      {/* Painel de Temas */}
      {showThemes && (
        <div className={`fixed top-16 right-4 z-50 rounded-xl border shadow-2xl p-4 w-56 ${currentTheme.card} ${currentTheme.border}`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-bold uppercase tracking-wider ${currentTheme.subtext}`}>Escolha um Tema</p>
            <button onClick={() => setShowThemes(false)} className={currentTheme.subtext}>
              <X size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => { setTheme(t); setShowThemes(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all border ${
                  currentTheme.id === t.id
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold'
                    : `${currentTheme.border} ${currentTheme.subtext} hover:bg-white/10`
                }`}
              >
                {t.name}
                {currentTheme.id === t.id && <span className="ml-2 text-xs">✓ Ativo</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}