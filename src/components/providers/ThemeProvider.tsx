// src/components/providers/ThemeProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Theme;
}

// Helper: set cookie theme (client-side)
function setThemeCookie(theme: Theme) {
  // Cookie berlaku 1 tahun
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `theme=${theme}; path=/; max-age=${oneYear}; SameSite=Lax`;
}

// Helper: apply class ke <html>
function applyThemeClass(theme: Theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function ThemeProvider({
  children,
  initialTheme = "light",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  // Sync dengan sistem theme di first mount (jika belum ada cookie)
  useEffect(() => {
    const hasCookie = document.cookie
      .split("; ")
      .some((c) => c.startsWith("theme="));

    if (!hasCookie) {
      // Belum ada preferensi user — pakai sistem
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const detected: Theme = systemDark ? "dark" : "light";
      setThemeState(detected);
      applyThemeClass(detected);
      setThemeCookie(detected);
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyThemeClass(t);
    setThemeCookie(t);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}