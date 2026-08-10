// app/components/Navbar.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Swords, LogOut, ChevronDown, Sun, Moon, Shield, Waves } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { themes, type Theme } from '../types/themes';

interface UserOverride {
  name?: string | null;
  email?: string | null;
}

interface NavbarProps {
  currentTheme?: Theme;
  setTheme?: (theme: Theme) => void;
  onLogout?: () => Promise<void> | void;
  showFullTitle?: boolean;
  userOverride?: UserOverride;
  ActiveTab?: string;
  setActiveTab?: (tab: string) => void;
}

const themeIcon = (themeId: string) => {
  switch (themeId) {
    case 'light': return <Sun size={16} />;
    case 'dark': return <Moon size={16} />;
    case 'military': return <Shield size={16} />;
    case 'ocean': return <Waves size={16} />;
    default: return <Sun size={16} />;
  }
};

const NAV_ITEMS = [
  { id: 'dash', label: 'Dashboard' },
  { id: 'water', label: 'Água' },
  { id: 'nutri', label: 'Nutrição' },
  { id: 'treino', label: 'Treino' },
  { id: 'evolucao', label: 'Evolução' },
];

function getFirstName(fullName: string | null): string {
  if (!fullName) return '';
  return fullName.split(' ')[0];
}

export function Navbar({
  currentTheme,
  setTheme,
  onLogout,
  showFullTitle = false,
  userOverride,
  ActiveTab,
  setActiveTab,
}: NavbarProps) {
  const [themeOpen, setThemeOpen] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    if (userOverride && (userOverride.name || userOverride.email)) {
      setUserName(userOverride.name ?? null);
      setUserEmail(userOverride.email ?? null);
      setLoadingUser(false);
      return;
    }
    async function loadUser() {
      setLoadingUser(true);
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        const u = data?.user;
        setUserName(u?.user_metadata?.name ?? u?.email ?? null);
        setUserEmail(u?.email ?? null);
      } catch (e) {
        console.warn('Erro ao buscar usuário:', e);
        if (mounted) {
          setUserName(null);
          setUserEmail(null);
        }
      } finally {
        if (mounted) setLoadingUser(false);
      }
    }
    loadUser();
    return () => { mounted = false; };
  }, [userOverride]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNavClick = (id: string) => {
    setActiveTab?.(id);
  };

  const handleThemeSelect = (theme: Theme) => {
    setTheme?.(theme);
    setThemeOpen(false);
  };

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
      } else {
        await supabase.auth.signOut();
        if (typeof window !== 'undefined') window.location.href = '/';
      }
    } catch (err) {
      console.error('Erro ao deslogar:', err);
    }
  };

  const isActive = (id: string) => ActiveTab === id;

  const navBaseClasses = "px-2 sm:px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex-shrink-0";
  const navActiveClasses = "bg-emerald-500 text-white shadow-sm";
  const navInactiveClasses = "hover:bg-emerald-500/20 hover:text-emerald-500";

  const themeNav = currentTheme?.nav ?? 'bg-white border-emerald-100';
  const firstName = getFirstName(userName);
  const displayName = loadingUser ? '...' : (firstName || 'Usuário');

  return (
    <header
      className={`w-full z-40 sticky top-0 ${themeNav} border-b transition-colors`}
      role="banner"
    >
      <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="rounded-full bg-emerald-500/10 p-1.5 sm:p-2">
              <Swords size={18} className="text-emerald-500" />
            </div>
            <button
              type="button"
              onClick={() => handleNavClick('dash')}
              className="flex flex-col items-start select-none bg-transparent border-none p-0"
              aria-label="Ir para Início"
            >
              <span
                className={`text-xs sm:text-sm font-black tracking-tight truncate ${currentTheme?.text ?? 'text-slate-900'}`}
                style={{ letterSpacing: '-0.02em' }}
              >
                PROTOCOLO ARES
              </span>
              <span className="w-full mt-0.5 border-b-2 border-emerald-500 rounded-sm" />
            </button>
          </div>

          {/* Abas - Scroll horizontal no mobile, flex normal no desktop */}
          <nav 
            className="flex items-center gap-1 sm:gap-2 overflow-x-auto" 
            role="navigation" 
            aria-label="Main navigation"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`${navBaseClasses} ${
                  isActive(item.id) ? navActiveClasses : navInactiveClasses
                } ${isActive(item.id) ? '' : (currentTheme?.text ?? 'text-slate-900')} bg-transparent border-none`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Ações: Tema + Usuário + Logout */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Seletor de Tema */}
            <div className="relative z-50" ref={themeRef}>
              <button
                type="button"
                onClick={() => setThemeOpen(o => !o)}
                className={`flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-md hover:bg-emerald-500/10 transition-colors text-sm font-bold select-none bg-transparent border-none ${currentTheme?.text ?? 'text-slate-900'}`}
                aria-expanded={themeOpen}
                aria-label="Selecionar tema"
                title="Selecionar tema"
                data-testid="theme-toggle"
              >
                {themeIcon(currentTheme?.id ?? 'light')}
                <span className="hidden sm:inline">{currentTheme?.name ?? 'Light'}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${themeOpen ? 'rotate-180' : ''}`} />
              </button>

              {themeOpen && (
                <div className={`absolute right-0 top-full mt-1 w-48 rounded-xl border-2 shadow-xl py-1.5 z-50 ${currentTheme?.card ?? 'bg-white'} ${currentTheme?.border ?? 'border-slate-200'}`}>
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleThemeSelect(theme)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold transition-colors bg-transparent border-none text-left ${
                        currentTheme?.id === theme.id
                          ? 'bg-emerald-500 text-white'
                          : `hover:bg-emerald-500/20 hover:text-emerald-500 ${currentTheme?.text ?? 'text-slate-900'}`
                      }`}
                    >
                      {themeIcon(theme.id)}
                      {theme.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Identificação do Usuário - Apenas Primeiro Nome */}
            <div className="hidden sm:flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className={`text-sm font-bold truncate max-w-[80px] ${currentTheme?.text ?? 'text-slate-900'}`}>
                {displayName}
              </span>
            </div>

            {/* Botão Sair */}
            <button
              type="button"
              onClick={handleLogout}
              className="px-2 sm:px-3 py-2 rounded-lg bg-rose-500 text-white text-xs sm:text-sm font-black hover:opacity-90 flex items-center gap-1 transition-opacity border-none cursor-pointer flex-shrink-0"
              title="Sair"
              data-testid="logout-btn"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;