import { Theme } from "@radix-ui/themes";
import { MotionConfig } from "framer-motion";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type AppTheme = "light" | "dark";

type ThemeContextValue = {
  theme: AppTheme;
  toggleTheme: () => void;
};

const THEME_KEY = "spotifysplit_theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

const getInitialTheme = (): AppTheme => {
  if (typeof window === "undefined") return "dark";

  const storedTheme = window.localStorage.getItem(THEME_KEY);
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme);

  useEffect(() => {
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MotionConfig reducedMotion="user">
        <Theme
          appearance={theme}
          accentColor="amber"
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
