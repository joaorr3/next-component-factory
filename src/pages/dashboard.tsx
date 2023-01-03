import { type Issue } from "@prisma/client";
import { type NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useTheme } from "styled-components";
import { A, P } from "../components/base";
import { useLoading } from "../utils/LoadingProvider";
import { trpc } from "../utils/trpc";

// export async function getServerSideProps(ctx: {
//   req: GetServerSidePropsContext["req"];
//   res: GetServerSidePropsContext["res"];
// }) {
//   const session = await getSession(ctx);
//   if (!session) {
//     return {
//       redirect: {
//         destination: "/",
//         permanent: false,
//       },
//     };
//   }

//   return {
//     props: {
//       session,
//     },
//   };
// }

const Dashboard: NextPage = ({}: { label?: string }) => {
  const [id, setId] = React.useState<string>("");
  const issue = trpc.issues.detail.useQuery({ id });
  const issues = trpc.issues.all.useQuery();
  const { data } = useSession();

  useLoading(!!data?.user && !issue.data && !issues.data);

  // React.useEffect(() => {
  //   if (!data?.user) {
  //     router.push("/");
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  if (!data?.user) {
    return (
      <div>
        <h1>UNAUTHORIZED</h1>
        <p>you will be redirect to homepage in 3s</p>
        <Link href="/">
          <A>go back</A>
        </Link>
      </div>
    );
  }

  return (
    <React.Fragment>
      <Head>
        <title>Dashboard</title>
      </Head>
      <main>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <P>ISSUES</P>
            <Link href="/">
              <A>go back</A>
            </Link>

            {data?.user && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginLeft: 24,
                }}
              >
                {data.user.image && (
                  <div style={{ borderRadius: 80, overflow: "hidden" }}>
                    <Image
                      src={data.user.image}
                      width={80}
                      height={80}
                      alt="user image"
                    />
                  </div>
                )}
                <p style={{ margin: 0, marginTop: 8 }}>{data.user.name}</p>
                <A
                  onClick={() =>
                    signOut({
                      callbackUrl: "/",
                    })
                  }
                >
                  Log out
                </A>
              </div>
            )}
          </div>

          <div>
            <div>
              <h3>Issue ID</h3>
              <input
                type="text"
                placeholder="Issue id"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </div>
          </div>

          <div>
            {issue.data ? (
              <IssueDetail issue={issue.data} />
            ) : (
              <IssueList issues={issues.data} />
            )}
          </div>
        </div>
      </main>
    </React.Fragment>
  );
};

export default Dashboard;

const IssueDetail: React.FC<{ issue: Issue | null | undefined }> = ({
  issue,
}) => {
  const { textColor } = useTheme();
  return (
    <div
      style={{
        padding: 12,
        border: `1px solid ${textColor}`,
        margin: 4,
      }}
    >
      <h3>{issue?.author}</h3>
      <h3>{issue?.title}</h3>
      <p>{issue?.description}</p>
    </div>
  );
};

const IssueList: React.FC<{ issues: Issue[] | null | undefined }> = ({
  issues,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: 200,
        overflowY: "scroll",
      }}
    >
      {issues?.map((issue, key) => (
        <IssueDetail key={key} issue={issue} />
      ))}
    </div>
  );
};
