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

  return <Provider theme={theme}>{children}</Provider>;
};

export default ThemeProvider;

export const useTheme = (): ThemeModel =>
  React.useContext<ThemeModel>(ThemeContext);
