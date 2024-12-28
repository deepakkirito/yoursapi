"use client";
import { dark } from "./palette/dark";
import { light } from "./palette/light";
import typography from "./typography";

const customTheme = (mode) => {
  return {
    typography: typography,
    palette: mode === "light" ? light : dark,
  };
};

export default customTheme;
