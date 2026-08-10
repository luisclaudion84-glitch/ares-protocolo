// app/components/Navbar.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Menu, X, Swords, LogOut, ChevronDown, Sun, Moon, Shield, Waves } from 'lucide-react';
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

export function Navbar({
  currentTheme,
  setTheme,
  onLogout,
  showFullTitle = false,
  userOverride,
  ActiveTab,
  setActiveTab,
}: NavbarProps) {
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const original = document.body.style.overflow || '';
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = original;
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const handleNavClick = (id: string) => {
    setActiveTab?.(id);
    setOpen(false);
  };

  const handleThemeSelect = (theme: Theme) => {
    setTheme?.(theme);
    setThemeOpen(false);
    setOpen(false);
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
    } finally {
      setOpen(false);
    }
  };

  const isActive = (id: string) => ActiveTab === id;

  const navBaseClasses = "px-3 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer";
  const navActiveClasses = "bg-emerald-500 text-white shadow-sm";
  const navInactiveClasses = "hover:bg-emerald-500/20 hover:text-emerald-500";

  const themeNav = currentTheme?.nav ?? 'bg-white border-emerald-100';

  return (
    <header
      className={`w-full z-40 sticky top-0 ${themeNav} border-b transition-colors`}
      role="banner"
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-3 min-w-0">
            <div className="rounded-full bg-emerald-500/10 p-2 flex-shrink-0">
              <Swords size={20} className="text-emerald-500" />
            </div>

            <div className="min-w-0">
              <button
                type="button"
                onClick={() => handleNavClick('dash')}
                className="flex flex-col items-start select-none bg-transparent border-none p-0"
                aria-label="Ir para Início"
              >
                <span
                  className={`text-sm font-black tracking-tight truncate max-w-[160px] ${
                    showFullTitle ? 'inline-block' : 'hidden sm:inline-block'
                  } ${currentTheme?.text ?? 'text-slate-900'}`}
                  style={{ letterSpacing: '-0.02em' }}
                >
                  PROTOCOLO ARES
                </span>
                <span className="w-full mt-0.5 border-b-2 border-emerald-500 rounded-sm" />
                <span
                  className={`text-xs font-bold text-gray-400 ${
                    showFullTitle ? 'hidden sm:inline-block' : 'sm:hidden'
                  }`}
                >
                  Ares
                </span>
              </button>
            </div>
          </div>

          <nav className="hidden sm:flex items-center gap-3 min-w-0" role="navigation" aria-label="Main navigation">
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

          <div className="flex items-center gap-2 min-w-0">
            <div className="relative z-50" ref={themeRef}>
              <button
                type="button"
                onClick={() => setThemeOpen(o => !o)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-emerald-500/10 transition-colors text-sm font-bold select-none bg-transparent border-none ${
                  currentTheme?.text ?? 'text-slate-900'
                }`}
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

            <div className="hidden sm:flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg min-w-0">
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
                  {(userName || userEmail || 'U').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <span
                  className={`text-sm font-bold truncate max-w-[120px] ${
                    currentTheme?.text ?? 'text-slate-900'
                  }`}
                >
                  {loadingUser ? 'Carregando...' : userName ?? (userEmail ?? 'Usuário')}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg bg-rose-500 text-white text-sm font-black hover:opacity-90 flex items-center gap-2 transition-opacity border-none cursor-pointer"
                title="Sair"
                data-testid="logout-desktop"
              >
                <LogOut size={16} /> <span className="hidden md:inline">Sair</span>
              </button>
            </div>

            <button
              type="button"
              className="sm:hidden p-2 rounded-md bg-transparent border-none cursor-pointer"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              data-testid="mobile-toggle"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`sm:hidden transition-[max-height] duration-200 ease-in-out overflow-hidden ${
          open ? 'max-h-[36rem]' : 'max-h-0'
        }`}
        aria-hidden={!open}
      >
        <div className={`px-4 pb-4 pt-2 border-t ${currentTheme?.border ?? 'border-slate-200'} ${currentTheme?.card ?? 'bg-white'}`}>
          <div className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg font-bold transition-colors cursor-pointer bg-transparent border-none ${
                  isActive(item.id)
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : `hover:bg-emerald-500/20 hover:text-emerald-500 ${currentTheme?.text ?? 'text-slate-900'}`
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="border-t pt-3">
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 px-3 ${currentTheme?.subtext ?? 'text-slate-500'}`}>
                Tema
              </p>
              <div className="flex flex-col gap-1">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleThemeSelect(theme)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer bg-transparent border-none text-left ${
                      currentTheme?.id === theme.id
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : `hover:bg-emerald-500/10 ${currentTheme?.text ?? 'text-slate-900'}`
                    }`}
                  >
                    {themeIcon(theme.id)}
                    {theme.name}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                  {(userName || userEmail || 'U').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <span className={`font-bold truncate ${currentTheme?.text ?? 'text-slate-900'}`}>
                  {loadingUser ? 'Carregando...' : userName ?? (userEmail ?? 'Usuário')}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full mt-3 px-3 py-2 rounded-lg bg-rose-500 text-white font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity border-none cursor-pointer"
                data-testid="logout-mobile"
              >
                <LogOut size={16} /> Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;