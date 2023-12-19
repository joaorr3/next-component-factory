import NextDocument, {
  Head,
  Html,
  Main,
  NextScript,
  type DocumentContext,
  type DocumentInitialProps,
} from "next/document";
import { ServerStyleSheet } from "styled-components";
import { setColorsByTheme } from "../theme";

export function MagicScriptTag() {
  const boundFn = String(setColorsByTheme);
  const iif = `(${boundFn})()`;
  return <script dangerouslySetInnerHTML={{ __html: iif }} />;
}

export default function Document() {
  return (
    <Html className="dark">
      <Head />
      <body className="bg-white text-black transition-colors duration-200 dark:bg-neutral-900 dark:text-neutral-300">
        <MagicScriptTag />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

Document.getInitialProps = async (
  ctx: DocumentContext
): Promise<DocumentInitialProps> => {
  const sheet = new ServerStyleSheet();
  const originalRenderPage = ctx.renderPage;

  try {
    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
      });

    const initialProps = await NextDocument.getInitialProps(ctx);
    return {
      ...initialProps,
      styles: (
        <>
          {initialProps.styles}
          {sheet.getStyleElement()}
        </>
      ),
    };
  } finally {
    sheet.seal();
  }
};
