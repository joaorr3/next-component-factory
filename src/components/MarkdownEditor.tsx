import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import type { MDEditorProps } from "@uiw/react-md-editor";
import { useTheme } from "../styles/ThemeProvider";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

function MarkdownEditor(props: MDEditorProps) {
  const { themeName } = useTheme();

  return <MDEditor {...props} data-color-mode={themeName} />;
}

export default MarkdownEditor;
