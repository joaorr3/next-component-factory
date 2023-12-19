import { type CSSProperties } from "styled-components";

export const themeNames = {
  light: "light",
  dark: "dark",
} as const;

export type ThemeNames = keyof typeof themeNames;

export type ThemeModel = {
  themeName: ThemeNames;
  backgroundColor: string;
  backgroundColorSecondary: string;
  textColor: string;
  linkColor: string;
  fontSize: CSSProperties["fontSize"];
};

const baseFontSize = 16;

export const Light: ThemeModel = {
  themeName: "light",
  backgroundColor: "#fff",
  backgroundColorSecondary: "#eaeaea",
  textColor: "#000",
  linkColor: "#2729bc",
  fontSize: baseFontSize,
};
export const Dark: ThemeModel = {
  themeName: "dark",
  backgroundColor: "#171717",
  backgroundColorSecondary: "#1e1e1e",
  textColor: "#D3D3D3",
  linkColor: "#5457eb",
  fontSize: baseFontSize,
};

export const Themes: Record<ThemeNames, ThemeModel> = {
  light: Light,
  dark: Dark,
};

export function setColorsByTheme() {
  const fallback = JSON.stringify("dark");
  const stored = JSON.parse(
    window.localStorage.getItem("currentTheme") || fallback
  );
  if (stored === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}
