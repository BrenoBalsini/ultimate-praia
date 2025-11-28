"use client";

import { ThemeProvider, useTheme } from "next-themes";
import * as React from "react";
import { LuMoon, LuSun } from "react-icons/lu";

export function ColorModeProvider({
  children,
  ...props
}: React.ComponentProps<typeof ThemeProvider>) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...props}>
      {children}
    </ThemeProvider>
  );
}

export type ColorMode = "light" | "dark";

export interface UseColorModeReturn {
  colorMode: ColorMode;
  setColorMode: (colorMode: ColorMode) => void;
  toggleColorMode: () => void;
}

// hook adaptado para next-themes
export function useColorMode(): UseColorModeReturn {
  const { theme, setTheme } = useTheme();

  const colorMode = (theme as ColorMode) || "light";

  const setColorMode = (mode: ColorMode) => setTheme(mode);

  const toggleColorMode = () =>
    setTheme(colorMode === "dark" ? "light" : "dark");

  return { colorMode, setColorMode, toggleColorMode };
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? (
    <LuMoon className="w-5 h-5" />
  ) : (
    <LuSun className="w-5 h-5" />
  );
}

type ColorModeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>(function ColorModeButton(props, ref) {
  const { toggleColorMode } = useColorMode();

  return (
    <button
      type="button"
      onClick={toggleColorMode}
      aria-label="Toggle color mode"
      ref={ref}
      className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
      {...props}
    >
      <ColorModeIcon />
    </button>
  );
});

// wrappers opcionais para forçar light/dark em partes da UI
export const LightMode = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function LightMode(props, ref) {
    return (
      <span
        ref={ref}
        {...props}
        className={`contents dark:hidden ${props.className ?? ""}`}
      />
    );
  },
);

export const DarkMode = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function DarkMode(props, ref) {
    return (
      <span
        ref={ref}
        {...props}
        className={`contents hidden dark:contents ${props.className ?? ""}`}
      />
    );
  },
);
