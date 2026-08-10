// app/routes/home.tsx
import { useState, useEffect } from 'react';
import { Navbar } from "../components/Navbar";
import { WaterTracker } from "../components/WaterTracker";
import NutritionTracker from "../components/NutritionTracker";
import { WorkoutManager } from '~/components/WorkoutManager';
import { UserProfileComponent } from "../components/UserProfile";
import { BodyComposition } from "../components/BodyComposition";
import { AuthModal } from "../components/AuthModal";
import { useAres } from "../hooks/useAres";
import { supabase } from '../lib/supabase';

export default function Home() {
  const { activeTab, setActiveTab, currentTheme, toggleTheme, setTheme } = useAres();
  const [session, setSession] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Lógica de Swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;
  const tabs = ['dash', 'water', 'nutri', 'treino', 'evolucao'];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    const currentIndex = tabs.indexOf(activeTab);

    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (isRightSwipe && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  if (!session) {
    return <AuthModal currentTheme={currentTheme} onLogin={() => {}} />;
  }

  return (
    <div 
      className={`min-h-screen transition-colors duration-500 ${currentTheme.bg} ${currentTheme.text}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Navbar 
        ActiveTab={activeTab}
        setActiveTab={setActiveTab}
        currentTheme={currentTheme}
        setTheme={setTheme}
        onLogout={handleLogout}
      />

      <main className="pt-20 px-4 pb-8 max-w-5xl mx-auto flex flex-col items-center">
        <div className="w-full flex flex-col items-center justify-center">
          
          {activeTab === 'dash' && (
            <UserProfileComponent currentTheme={currentTheme} />
          )}

          {activeTab === 'water' && (
            <WaterTracker currentTheme={currentTheme} />
          )}

          {activeTab === 'treino' && (
            <WorkoutManager currentTheme={currentTheme} />
          )}

          {activeTab === 'nutri' && (
            <NutritionTracker currentTheme={currentTheme} />
          )}

          {activeTab === 'evolucao' && (
            <BodyComposition currentTheme={currentTheme} />
          )}

        </div>
      </main>
    </div>
  );
}