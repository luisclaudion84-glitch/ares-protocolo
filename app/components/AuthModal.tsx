// app/components/AuthModal.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export function AuthModal({ currentTheme, onLogin }: { currentTheme: any, onLogin: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos' : error.message);
    } else {
      onLogin(); // Notifica o app que estamos logados
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className={`w-full max-w-sm rounded-[2rem] border-2 p-8 shadow-2xl ${currentTheme.card} ${currentTheme.border}`}>
        
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="bg-emerald-500/20 p-4 rounded-full mb-2">
            <ShieldCheck className="text-emerald-500" size={40} />
          </div>
          <h2 className={`text-3xl font-black uppercase italic tracking-tighter ${currentTheme.text}`}>
            Ares Protocol
          </h2>
          <p className={`text-xs font-bold uppercase tracking-widest ${currentTheme.subtext}`}>
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta beta'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className={`text-[10px] font-black uppercase ml-2 ${currentTheme.subtext}`}>E-mail</label>
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className={`w-full p-4 rounded-2xl bg-black/20 border outline-none focus:border-emerald-500 font-bold transition-all ${currentTheme.border} ${currentTheme.text}`}
              placeholder="exemplo@email.com"
            />
          </div>

          <div className="space-y-1">
            <label className={`text-[10px] font-black uppercase ml-2 ${currentTheme.subtext}`}>Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                className={`w-full p-4 rounded-2xl bg-black/20 border outline-none focus:border-emerald-500 font-bold transition-all ${currentTheme.border} ${currentTheme.text}`}
                placeholder="••••••••"
              />
              <button 
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}

          <button 
            type="submit" disabled={loading}
            className={`w-full p-5 mt-4 font-black rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all
              ${loading ? 'bg-gray-600 opacity-50' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
          >
            {loading ? 'Processando...' : isLogin ? <><LogIn size={20} /> Entrar</> : <><UserPlus size={20} /> Registrar</>}
          </button>
        </form>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className={`w-full mt-6 text-[10px] font-black uppercase tracking-widest hover:underline ${currentTheme.subtext}`}
        >
          {isLogin ? 'Não tem conta? Registre-se' : 'Já tem conta? Faça login'}
        </button>
      </div>
    </div>
  );
}