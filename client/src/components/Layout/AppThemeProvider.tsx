import { Theme } from "@radix-ui/themes";
import { MotionConfig } from "framer-motion";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type AppTheme = "light" | "dark";

// Cores de acento disponiveis. Cada valor e um accentColor valido do Radix e
// substitui o ambar em todo o app (CSS usa --accent-*, componentes herdam o tema).
export type AppAccent = "amber" | "green" | "ruby";

export const ACCENT_OPTIONS: ReadonlyArray<{
  value: AppAccent;
  label: string;
  swatch: string;
}> = [
  { value: "amber", label: "Âmbar", swatch: "#FFC53D" },
  { value: "green", label: "Verde", swatch: "#30A46C" },
  { value: "ruby", label: "Vermelho", swatch: "#E5484D" },
];

type ThemeContextValue = {
  theme: AppTheme;
  toggleTheme: () => void;
  accent: AppAccent;
  setAccent: (accent: AppAccent) => void;
};

const THEME_KEY = "spotifysplit_theme";
const ACCENT_KEY = "spotifysplit_accent";
const ThemeContext = createContext<ThemeContextValue | null>(null);

const getInitialTheme = (): AppTheme => {
  if (typeof window === "undefined") return "dark";

  const storedTheme = window.localStorage.getItem(THEME_KEY);
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const isAppAccent = (value: string | null): value is AppAccent =>
  ACCENT_OPTIONS.some((option) => option.value === value);

const getInitialAccent = (): AppAccent => {
  if (typeof window === "undefined") return "amber";

  const stored = window.localStorage.getItem(ACCENT_KEY);
  return isAppAccent(stored) ? stored : "amber";
};

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme);
  const [accent, setAccentState] = useState<AppAccent>(getInitialAccent);

  useEffect(() => {
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(ACCENT_KEY, accent);
  }, [accent]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
      accent,
      setAccent: setAccentState,
    }),
    [theme, accent]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MotionConfig reducedMotion="user">
        <Theme
          appearance={theme}
          accentColor={accent}
          grayColor="sand"
          radius="large"
          scaling="100%"
        >
          {children}
          <div className="grain-overlay" aria-hidden="true" />
        </Theme>
      </MotionConfig>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }

  return context;
};
