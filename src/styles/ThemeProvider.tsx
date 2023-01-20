import React from "react";
import { ThemeContext, ThemeProvider as Provider } from "styled-components";
import { Themes, type ThemeModel } from "../theme";
import { useGlobalState } from "../utils/GlobalState/GlobalStateProvider";

const ThemeProvider = ({ children }: React.PropsWithChildren) => {
  const {
    state: { themeName },
  } = useGlobalState();

  const theme = React.useMemo(() => {
    return Themes[themeName];
  }, [themeName]);

  React.useEffect(() => {
    const root = document.documentElement;

    const darkBg = Themes.dark.backgroundColor;
    const darkFg = Themes.dark.textColor;
    const lightBg = Themes.light.backgroundColor;
    const lightFg = Themes.light.textColor;

    if (themeName === "dark") {
      root.style.setProperty("--color-bg", darkBg);
      root.style.setProperty("--color-fg", darkFg);
    } else if (themeName === "light") {
      root.style.setProperty("--color-bg", lightBg);
      root.style.setProperty("--color-fg", lightFg);
    }
  }, [themeName]);

  return <Provider theme={theme}>{children}</Provider>;
};

export default ThemeProvider;

export const useTheme = (): ThemeModel =>
  React.useContext<ThemeModel>(ThemeContext);
