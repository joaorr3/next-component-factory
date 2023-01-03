import React from "react";
import styled from "styled-components";
import { type ThemeNames } from "../theme";
import { DarkModeSwitch } from "react-toggle-dark-mode";

type Props = {
  initial: ThemeNames | null;
  onChange: (theme: ThemeNames | null) => void;
};

const ThemeSwitcher = ({ initial, onChange }: Props) => {
  const handleSwitch = () => {
    const nextTheme: ThemeNames = initial === "dark" ? "light" : "dark";
    onChange(nextTheme);
  };

  return (
    <DarkModeSwitch
      style={{ margin: "0px 12px" }}
      checked={initial === "dark"}
      onChange={() => {
        handleSwitch();
      }}
    />
  );
};

export default ThemeSwitcher;
