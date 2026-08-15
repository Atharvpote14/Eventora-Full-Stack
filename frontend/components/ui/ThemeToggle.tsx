"use client";

import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <div className="theme-toggle">
      <label className="switch">
        <input
          type="checkbox"
          className="togglesw"
          checked={theme === "dark"}
          onChange={toggleTheme}
          aria-label={label}
          title={label}
        />
        <div className="indicator left" aria-hidden />
        <div className="indicator right" aria-hidden />
        <div className="button" aria-hidden />
      </label>
    </div>
  );
}
