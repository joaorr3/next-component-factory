import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import MarkdownEditor from "../../components/MarkdownEditor";
import { useTheme } from "../../styles/ThemeProvider";
import { withRoles } from "../../utils/hoc";

export const Faq = (): JSX.Element => {
  const router = useRouter();
  const { id } = router.query;

  const [mdString, setMdString] = React.useState<string>("");
  console.log("mdString: ", mdString);
  const { themeName } = useTheme();

  return (
    <React.Fragment>
      <Head>
        <title>FAQ: {id}</title>
      </Head>

      <div>FAQ: {id}</div>

      <MarkdownEditor
        visible
        height="500px"
        value={mdString}
        enableScroll
        onChange={(value) => setMdString(value)}
        theme={themeName}
      />
    </React.Fragment>
  );
};

export default withRoles(Faq, "FAQs");
