import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import type { MarkdownPreviewProps } from "@uiw/react-markdown-preview";

import { useTheme } from "../styles/ThemeProvider";
import { montserrat } from "../pages/_app";

const MDViewer = dynamic(
  () =>
    import("@uiw/react-md-editor").then((mod) => {
      return mod.default.Markdown;
    }),
  { ssr: false }
);

function MarkdownViewer(props: MarkdownPreviewProps) {
  const { themeName } = useTheme();

  return (
    <MDViewer {...props} style={montserrat.style} data-color-mode={themeName} />
  );
}

export default MarkdownViewer;
