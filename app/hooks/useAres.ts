// app/hooks/useAres.ts
import { useState, useEffect, useCallback } from 'react';
import { themes, type Theme } from '../types/themes';
import { loadProfile, type SavedProfile } from '../lib/profileStorage';

const THEME_STORAGE_KEY = 'ares_theme_id';
const TAB_STORAGE_KEY = 'ares_active_tab';

export function useAres() {
  const [activeTab, setActiveTabState] = useState<string>(() => {
    if (typeof window === 'undefined') return 'dash';
    return localStorage.getItem(TAB_STORAGE_KEY) || 'dash';
  });

  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return themes[0];
    const savedId = localStorage.getItem(THEME_STORAGE_KEY);
    return themes.find((t) => t.id === savedId) || themes[0];
  });

  const [userProfile, setUserProfile] = useState<SavedProfile | null>(null);

  useEffect(() => {
    const profile = loadProfile();
    if (profile) setUserProfile(profile);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TAB_STORAGE_KEY, activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, currentTheme.id);
    }
  }, [currentTheme]);

  const setActiveTab = useCallback((tab: string) => {
    setActiveTabState(tab);
  }, []);

  const toggleTheme = useCallback(() => {
    setCurrentTheme((prev) => {
      const currentIndex = themes.findIndex((t) => t.id === prev.id);
      const nextIndex = (currentIndex + 1) % themes.length;
      return themes[nextIndex];
    });
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    setCurrentTheme(theme);
  }, []);

  return {
    activeTab,
    setActiveTab,
    currentTheme,
    toggleTheme,
    setTheme,
    userProfile,
    refreshProfile: () => setUserProfile(loadProfile())
  };
}