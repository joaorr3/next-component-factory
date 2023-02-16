import { createGlobalStyle, css } from "styled-components";
import { type ThemeModel } from "../theme";

//region Normalize
export const normalize = css`
  /* http://meyerweb.com/eric/tools/css/reset/ 
   v2.0 | 20110126
   License: none (public domain)
*/

  html,
  body,
  div,
  span,
  applet,
  object,
  iframe,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  blockquote,
  pre,
  a,
  abbr,
  acronym,
  address,
  big,
  cite,
  code,
  del,
  dfn,
  em,
  img,
  ins,
  kbd,
  q,
  s,
  samp,
  small,
  strike,
  strong,
  sub,
  sup,
  tt,
  var,
  b,
  u,
  i,
  center,
  dl,
  dt,
  dd,
  ol,
  ul,
  li,
  fieldset,
  form,
  label,
  legend,
  table,
  caption,
  tbody,
  tfoot,
  thead,
  tr,
  th,
  td,
  article,
  aside,
  canvas,
  details,
  embed,
  figure,
  figcaption,
  footer,
  header,
  hgroup,
  menu,
  nav,
  output,
  ruby,
  section,
  summary,
  time,
  mark,
  audio,
  video {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
  }
  /* HTML5 display-role reset for older browsers */
  article,
  aside,
  details,
  figcaption,
  figure,
  footer,
  header,
  hgroup,
  menu,
  nav,
  section {
    display: block;
  }
  body {
    line-height: 1;
  }
  ol,
  ul {
    list-style: none;
  }
  blockquote,
  q {
    quotes: none;
  }
  blockquote:before,
  blockquote:after,
  q:before,
  q:after {
    content: "";
    content: none;
  }
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }
`;

//endregion

export const customScrollBar = css`
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #686868;
    border-radius: 4px;
    border: 1px solid transparent;
    background-clip: padding-box;
  }
`;

export const reactMdEditor = css`
  .w-md-editor {
    box-shadow: none;
    background-color: transparent;
  }

  .w-md-editor-fullscreen {
    background-color: rgba(33, 33, 33) !important;
  }

  .md-edit {
    background-color: rgba(64, 64, 64, 0.2);
    border-radius: 12px;

    .wmde-markdown {
      box-shadow: none;
      background-color: transparent;
    }

    .w-md-editor-bar {
      opacity: 0.2;
    }

    .w-md-editor-toolbar {
      background-color: transparent;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      padding: 12px;
    }
  }

  .wmde-markdown {
    box-shadow: none;
    background-color: transparent;
  }
`;

export const GlobalStyle = createGlobalStyle<{ theme: ThemeModel }>`  
  ${normalize}
  ${reactMdEditor}
  
  html {
    font-size: 100%;

    &.dark {
      color-scheme: dark;
    }
  }
  
  body {
    overflow-x: hidden;
    overflow-y: scroll;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    position: relative;
    min-height: 100vh;
  }

  #__next {
    height: 100%;
    width: 100%;
  }
`;
