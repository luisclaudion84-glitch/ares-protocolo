// app/components/AuthModal.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Eye, EyeOff, ShieldCheck, Mail } from 'lucide-react';

type Mode = 'login' | 'register' | 'forgot';

export function AuthModal({ currentTheme, onLogin }: { currentTheme: any; onLogin: () => void }) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const changeMode = (newMode: Mode) => {
    setMode(newMode);
    setError(null);
    setInfo(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos' : error.message);
    } else {
      onLogin();
    }
    setLoading(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const redirectTo = import.meta.env.PROD
      ? 'https://ares-protocolo.vercel.app/'
      : `${window.location.origin}/`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      setError(error.message);
    } else {
      setInfo('Se houver uma conta com esse e-mail, você receberá as instruções de recuperação. Verifique também o spam.');
    }
    setLoading(false);
  };

  const inputClass = `w-full p-4 rounded-2xl bg-black/20 border outline-none focus:border-emerald-500 font-bold transition-all ${currentTheme.border} ${currentTheme.text}`;

  const subtitle =
    mode === 'login' ? 'Bem-vindo de volta' : mode === 'register' ? 'Crie sua conta beta' : 'Recuperar acesso';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className={`w-full max-w-sm rounded-[2rem] border-2 p-8 shadow-2xl ${currentTheme.card} ${currentTheme.border}`}>
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="bg-emerald-500/20 p-4 rounded-full mb-2">
            <ShieldCheck className="text-emerald-500" size={40} />
          </div>
          <h2 className={`text-3xl font-black uppercase italic tracking-tighter ${currentTheme.text}`}>
            Protocolo Ares 
          </h2>
          <p className={`text-xs font-bold uppercase tracking-widest ${currentTheme.subtext}`}>{subtitle}</p>
        </div>

        {mode === 'forgot' ? (
          <form onSubmit={handleForgot} className="space-y-4">
            <p className={`text-xs font-bold text-center ${currentTheme.subtext}`}>
              Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.
            </p>

            <div className="space-y-1">
              <label className={`text-[10px] font-black uppercase ml-2 ${currentTheme.subtext}`}>E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="exemplo@email.com"
              />
            </div>

            {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}
            {info && <p className="text-emerald-500 text-[10px] font-black uppercase text-center">{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full p-5 mt-4 font-black rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all
                ${loading ? 'bg-gray-600 opacity-50' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
            >
              {loading ? (
                'Enviando...'
              ) : (
                <>
                  <Mail size={20} /> Enviar link
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className={`text-[10px] font-black uppercase ml-2 ${currentTheme.subtext}`}>E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="exemplo@email.com"
              />
            </div>

            <div className="space-y-1">
              <label className={`text-[10px] font-black uppercase ml-2 ${currentTheme.subtext}`}>Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {mode === 'login' && (
                <div className="text-right pr-2 pt-1">
                  <button
                    type="button"
                    onClick={() => changeMode('forgot')}
                    className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full p-5 mt-4 font-black rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all
                ${loading ? 'bg-gray-600 opacity-50' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
            >
              {loading ? (
                'Processando...'
              ) : mode === 'login' ? (
                <>
                  <LogIn size={20} /> Entrar
                </>
              ) : (
                <>
                  <UserPlus size={20} /> Registrar
                </>
              )}
            </button>
          </form>
        )}

        <button
          onClick={() => changeMode(mode === 'login' ? 'register' : 'login')}
          className={`w-full mt-6 text-[10px] font-black uppercase tracking-widest hover:underline ${currentTheme.subtext}`}
        >
          {mode === 'login'
            ? 'Não tem conta? Registre-se'
            : mode === 'register'
            ? 'Já tem conta? Faça login'
            : 'Voltar ao login'}
        </button>
      </div>
    </div>
  );
}