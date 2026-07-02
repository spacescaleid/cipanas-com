// src/components/providers/ThemeProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

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

// Helper: set cookie theme
function setThemeCookie(theme: Theme) {
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

// Helper: detect initial theme dari cookie atau system preference (client-side only)
function detectInitialTheme(fallback: Theme): Theme {
  if (typeof window === "undefined") return fallback;

  // Cek cookie
  const cookieMatch = document.cookie
    .split("; ")
    .find((c) => c.startsWith("theme="));

  if (cookieMatch) {
    const value = cookieMatch.split("=")[1] as Theme;
    if (value === "dark" || value === "light") return value;
  }

  // Fallback ke system preference
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return systemDark ? "dark" : "light";
}

export function ThemeProvider({
  children,
  initialTheme = "light",
}: ThemeProviderProps) {
  // Lazy init: detect theme sekali saat initial render (tidak trigger effect)
  const [theme, setThemeState] = useState<Theme>(() => {
    // Di server: pakai initialTheme dari props
    if (typeof window === "undefined") return initialTheme;
    // Di client: detect dari cookie/system
    return detectInitialTheme(initialTheme);
  });

  // Ref untuk track apakah sudah first sync (hindari sync ulang saat re-render)
  const hasSyncedRef = useRef(false);

  // First-mount sync: apply theme class + set cookie kalau belum ada
  // Effect ini tidak setState — hanya side effect DOM
  useEffect(() => {
    if (hasSyncedRef.current) return;
    hasSyncedRef.current = true;

    applyThemeClass(theme);

    // Set cookie kalau belum ada
    const hasCookie = document.cookie
      .split("; ")
      .some((c) => c.startsWith("theme="));

    if (!hasCookie) {
      setThemeCookie(theme);
    }
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyThemeClass(t);
    setThemeCookie(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === "light" ? "dark" : "light";
      applyThemeClass(next);
      setThemeCookie(next);
      return next;
    });
  }, []);

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