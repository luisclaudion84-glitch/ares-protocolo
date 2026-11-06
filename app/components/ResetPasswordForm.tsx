// app/components/ResetPasswordForm.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, KeyRound } from 'lucide-react';

export function ResetPasswordForm({ currentTheme, onDone }: { currentTheme: any; onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Limpa o token da URL
    window.history.replaceState(null, '', window.location.pathname);
    setSuccess(true);
    setTimeout(onDone, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className={`w-full max-w-sm rounded-[2rem] border-2 p-8 shadow-2xl ${currentTheme.card} ${currentTheme.border}`}>
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="bg-emerald-500/20 p-4 rounded-full mb-2">
            <KeyRound className="text-emerald-500" size={40} />
          </div>
          <h2 className={`text-2xl font-black uppercase italic tracking-tighter ${currentTheme.text}`}>
            Nova senha
          </h2>
          <p className={`text-xs font-bold uppercase tracking-widest ${currentTheme.subtext}`}>
            Defina sua nova senha de acesso
          </p>
        </div>

        {success ? (
          <p className="text-emerald-500 text-xs font-black uppercase text-center">
            Senha alterada com sucesso! Entrando...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className={`text-[10px] font-black uppercase ml-2 ${currentTheme.subtext}`}>Nova senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
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

            <div className="space-y-1">
              <label className={`text-[10px] font-black uppercase ml-2 ${currentTheme.subtext}`}>Confirmar senha</label>
              <input
                type={showPassword ? 'text' : 'password'} required value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className={`w-full p-4 rounded-2xl bg-black/20 border outline-none focus:border-emerald-500 font-bold transition-all ${currentTheme.border} ${currentTheme.text}`}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}

            <button
              type="submit" disabled={loading}
              className={`w-full p-5 mt-4 font-black rounded-2xl uppercase tracking-widest shadow-xl transition-all
                ${loading ? 'bg-gray-600 opacity-50' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
            >
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}