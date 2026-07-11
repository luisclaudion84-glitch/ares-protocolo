// app/hooks/useAres.ts
import { useState, useEffect } from 'react';
import { themes, type Theme } from '../types/themes';
import { loadProfile, type SavedProfile } from '../lib/profileStorage';

export function useAres() {
  const [activeTab, setActiveTab] = useState('dash');
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [userProfile, setUserProfile] = useState<SavedProfile | null>(null);

  // Carrega dados iniciais
  useEffect(() => {
    const profile = loadProfile();
    if (profile) setUserProfile(profile);
  }, []);

  // Função para mudar o tema e persistir se quisermos (opcional)
  const toggleTheme = (theme: Theme) => {
    setCurrentTheme(theme);
  };

  return {
    activeTab,
    setActiveTab,
    currentTheme,
    toggleTheme,
    userProfile,
    refreshProfile: () => setUserProfile(loadProfile())
  };
}