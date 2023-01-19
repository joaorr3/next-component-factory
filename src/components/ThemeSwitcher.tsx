import React from "react";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import { localStorageActions } from "../hooks/useLocalStorage";
import { type ThemeNames } from "../theme";
import { useGlobalState } from "../utils/GlobalState/GlobalStateProvider";

const ThemeSwitcher = () => {
  const { state, actions } = useGlobalState();

  const handleSwitch = React.useCallback(() => {
    const nextTheme: ThemeNames = state.themeName === "dark" ? "light" : "dark";

    actions.setThemeName(nextTheme, (p) => {
      localStorageActions.set("currentTheme", p);
    });
  }, [actions, state.themeName]);

  return (
    <DarkModeSwitch
      style={{ margin: "0px 12px" }}
      checked={state.themeName === "dark"}
      onChange={() => {
        handleSwitch();
      }}
    />
  );
};

export default ThemeSwitcher;
