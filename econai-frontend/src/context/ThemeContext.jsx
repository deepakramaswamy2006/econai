import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({ dark: true, toggle: () => {} });

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const s = localStorage.getItem("econai_theme");
    return s !== null ? s === "dark" : true; // default: dark
  });

  // Sync data-theme on the root element so CSS variables cascade everywhere
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  const toggle = () =>
    setDark((d) => {
      const next = !d;
      localStorage.setItem("econai_theme", next ? "dark" : "light");
      return next;
    });

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
