import React from "react";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import { localStorageActions } from "../hooks/useLocalStorage";
import { type ThemeNames } from "../theme";
import { useGlobalState } from "../utils/GlobalState/GlobalStateProvider";
import { InteractionWrapper } from "./InteractionWrapper";

const ThemeSwitcher = () => {
  const { state, actions } = useGlobalState();

  const handleSwitch = React.useCallback(() => {
    const nextTheme: ThemeNames = state.themeName === "dark" ? "light" : "dark";

    actions.setThemeName(nextTheme, (p) => {
      localStorageActions.set("currentTheme", p);
      setThemeName(p);
    });
  }, [actions, state.themeName]);

  return (
    <InteractionWrapper round onPress={handleSwitch}>
      <DarkModeSwitch
        style={{ margin: "0px 12px" }}
        checked={state.themeName === "dark"}
        onChange={() => void 0}
      />
    </InteractionWrapper>
  );
};

const setThemeName = (themeName: ThemeNames) => {
  if (themeName === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export default ThemeSwitcher;
