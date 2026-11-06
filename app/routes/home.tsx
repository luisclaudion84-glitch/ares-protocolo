// app/routes/home.tsx
import { useState, useEffect } from 'react';
import { Navbar } from "../components/Navbar";
import { WaterTracker } from "../components/WaterTracker";
import NutritionTracker from "../components/NutritionTracker";
import { WorkoutManager } from '~/components/WorkoutManager';
import { UserProfileComponent } from "../components/UserProfile";
import { BodyComposition } from "../components/BodyComposition";
import { AuthModal } from "../components/AuthModal";
import { ResetPasswordForm } from "../components/ResetPasswordForm";
import { useAres } from "../hooks/useAres";
import { supabase } from '../lib/supabase';

export default function Home() {
  const { activeTab, setActiveTab, currentTheme, setTheme } = useAres();
  const [session, setSession] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    // Link de recuperação aberto: marca o fluxo (só roda no navegador)
    if (window.location.hash.includes('type=recovery')) {
      setIsRecovering(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovering(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/90 text-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm font-bold uppercase tracking-widest">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // Fluxo de recuperação tem prioridade sobre o painel
  if (isRecovering && session) {
    return (
      <ResetPasswordForm
        currentTheme={currentTheme}
        onDone={() => setIsRecovering(false)}
      />
    );
  }

  if (!session) {
    return <AuthModal currentTheme={currentTheme} onLogin={() => {}} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${currentTheme.bg} ${currentTheme.text}`}>
      <Navbar
        ActiveTab={activeTab}
        setActiveTab={setActiveTab}
        currentTheme={currentTheme}
        setTheme={setTheme}
        onLogout={handleLogout}
      />

      <main className="pt-20 px-4 pb-8 max-w-5xl mx-auto flex flex-col items-center">
        <div className="w-full flex flex-col items-center justify-center">
          {activeTab === 'dash' && <UserProfileComponent currentTheme={currentTheme} />}
          {activeTab === 'water' && <WaterTracker currentTheme={currentTheme} />}
          {activeTab === 'treino' && <WorkoutManager currentTheme={currentTheme} />}
          {activeTab === 'nutri' && <NutritionTracker currentTheme={currentTheme} />}
          {activeTab === 'evolucao' && <BodyComposition currentTheme={currentTheme} />}
        </div>
      </main>
    </div>
  );
}