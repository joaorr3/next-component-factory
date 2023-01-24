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

const Styles = () => {
  const s = `
    html {
      background-color: var(--color-bg);
      color: var(--color-fg);
    }`;

  return <style>{s}</style>;
};

export default function Document() {
  return (
    <Html>
      <Head>
        <Styles />
      </Head>
      <body>
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
