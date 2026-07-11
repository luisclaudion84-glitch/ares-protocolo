// app/routes/home.tsx
import { Navbar } from "../components/Navbar";
import { WaterTracker } from "../components/WaterTracker";
import NutritionTracker from "../components/NutritionTracker";
import { WorkoutManager } from '~/components/WorkoutManager';
import { UserProfileComponent } from "../components/UserProfile";
import { BodyComposition } from "../components/BodyComposition";
import { useAres } from "../hooks/useAres";

export default function Home() {
  const { activeTab, setActiveTab, currentTheme, toggleTheme } = useAres();

  return (
    <div className={`min-h-screen transition-colors duration-500 ${currentTheme.bg} ${currentTheme.text}`}>
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentTheme={currentTheme}
        setTheme={toggleTheme}
      />

      <main className="pt-20 px-4 pb-8 max-w-5xl mx-auto flex flex-col items-center">
        <div className="w-full flex flex-col items-center justify-center">
          
          {/* Gerenciador de Abas */}
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