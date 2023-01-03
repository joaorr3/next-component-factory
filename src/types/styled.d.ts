import { type ThemeModel } from "../theme";

//Overload and extend DefaultTheme so you don't have to type everything down over and over.
declare module "styled-components" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends ThemeModel {}
}
