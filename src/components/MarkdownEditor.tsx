import dynamic from "next/dynamic";
import "@uiw/react-markdown-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import type { IMarkdownEditor } from "@uiw/react-markdown-editor";

const MarkdownEditorComponent = dynamic(
  () => import("@uiw/react-markdown-editor").then((mod) => mod.default),
  { ssr: false }
);

type IMarkdownEditorProps = IMarkdownEditor;

function MarkdownEditor(props: IMarkdownEditorProps) {
  return (
    <div>
      <MarkdownEditorComponent {...props} />
    </div>
  );
}

export default MarkdownEditor;
