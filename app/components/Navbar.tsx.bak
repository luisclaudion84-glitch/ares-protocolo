// app/components/Navbar.tsx
import React, { useEffect, useState } from 'react';
import { Menu, X, Sun, Moon, User2, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase'; // use caminho relativo como no resto do projeto

type ThemeShape = {
  id?: string;
  card?: string;
  border?: string;
  text?: string;
  subtext?: string;
};

interface NavbarProps {
  currentTheme?: ThemeShape;
  onToggleTheme?: () => void;
  onLogout?: () => Promise<void> | void;
  showFullTitle?: boolean;
}

export function Navbar({ currentTheme = {}, onToggleTheme, onLogout, showFullTitle = false }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      setLoadingUser(true);
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setUserName(data?.user?.email ?? data?.user?.user_metadata?.name ?? null);
      } catch (e) {
        console.warn('Erro ao buscar usuário:', e);
        if (mounted) setUserName(null);
      } finally {
        if (mounted) setLoadingUser(false);
      }
    }
    loadUser();
    return () => { mounted = false; };
  }, []);

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
      } else {
        await supabase.auth.signOut();
        // redirecionamento simples: volta para raiz
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Erro ao deslogar:', err);
    } finally {
      setOpen(false);
    }
  };

  const isDark = !(currentTheme?.card?.includes('white') || currentTheme?.card?.includes('gray-100') || currentTheme?.card?.includes('slate-100'));

  return (
    <header className={`w-full z-40 sticky top-0 ${currentTheme.card ?? 'bg-white'} ${currentTheme.border ?? 'border-b'} transition-colors`}>
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-3 min-w-0">
            <div className="rounded-full bg-emerald-500/10 p-2">
              <span className="text-emerald-500 font-black select-none">A</span>
            </div>

            <div className="min-w-0">
              <a href="/" onClick={() => setOpen(false)} className="flex items-baseline gap-2">
                <span className={`text-sm font-black tracking-tight truncate max-w-[160px] ${showFullTitle ? 'inline-block' : 'hidden sm:inline-block'}`} style={{ letterSpacing: '-0.02em' }}>
                  PROTOCOLO ARES
                </span>
                <span className={`text-xs font-bold text-gray-400 ${showFullTitle ? 'hidden sm:inline-block' : 'sm:hidden'}`}>Ares</span>
              </a>
            </div>
          </div>

          <nav className="hidden sm:flex items-center gap-3">
            <a href="/dashboard" className="px-3 py-2 rounded-lg text-xs font-bold hover:opacity-90">Dashboard</a>
            <a href="/nutrition" className="px-3 py-2 rounded-lg text-xs font-bold hover:opacity-90">Nutrição</a>
            <a href="/training" className="px-3 py-2 rounded-lg text-xs font-bold hover:opacity-90">Treino</a>
            <a href="/profile" className="px-3 py-2 rounded-lg text-xs font-bold hover:opacity-90">Perfil</a>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => { onToggleTheme?.(); setOpen(false); }} className="p-2 rounded-md hover:bg-black/5" aria-label="Alternar tema" title="Alternar tema">
              {currentTheme?.id === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg">
                <User2 size={18} />
                <span className="text-sm font-bold truncate max-w-[120px]">
                  {loadingUser ? 'Carregando...' : (userName ?? 'Usuário')}
                </span>
              </div>
              <button onClick={handleLogout} className="px-3 py-2 rounded-lg bg-rose-500 text-white text-sm font-black hover:opacity-90 flex items-center gap-2" title="Sair">
                <LogOut size={16} /> Sair
              </button>
            </div>

            <button className="sm:hidden p-2 rounded-md" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label={open ? 'Fechar menu' : 'Abrir menu'}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className={`sm:hidden transition-[max-height] duration-200 ease-in-out overflow-hidden ${open ? 'max-h-96' : 'max-h-0'}`}>
        <div className={`px-4 pb-4 pt-2 border-t ${currentTheme.border ?? 'border-t'} ${currentTheme.card ?? 'bg-white'}`}>
          <div className="flex flex-col gap-3">
            <a href="/dashboard" onClick={() => setOpen(false)} className="w-full text-left px-3 py-2 rounded-lg font-bold">Dashboard</a>
            <a href="/nutrition" onClick={() => setOpen(false)} className="w-full text-left px-3 py-2 rounded-lg font-bold">Nutrição</a>
            <a href="/training" onClick={() => setOpen(false)} className="w-full text-left px-3 py-2 rounded-lg font-bold">Treino</a>
            <a href="/profile" onClick={() => setOpen(false)} className="w-full text-left px-3 py-2 rounded-lg font-bold">Perfil</a>

            <div className="border-t pt-3">
              <button onClick={() => { onToggleTheme?.(); setOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2">
                {currentTheme?.id === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span className="font-bold">Alternar tema</span>
              </button>

              <div className="mt-3 flex items-center gap-2">
                <User2 size={18} />
                <span className="font-bold truncate">{loadingUser ? 'Carregando...' : (userName ?? 'Usuário')}</span>
              </div>

              <button onClick={handleLogout} className="w-full mt-3 px-3 py-2 rounded-lg bg-rose-500 text-white font-black flex items-center justify-center gap-2">
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