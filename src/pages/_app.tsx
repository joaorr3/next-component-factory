import type { GuildUser } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { type Session } from "next-auth";
import { getSession, SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Montserrat } from "next/font/google";
import { useRouter } from "next/router";
import React from "react";
import { AppContainer } from "../components/AppContainer";
import { GLobalProfileLayer } from "../components/GlobalProfileLayer";
import { HomeButton } from "../components/HomeButton";
import { NewIssueShortcut } from "../components/Issue/NewIssueShortcut";
import Loader from "../components/Loader";
import { LoginButton } from "../components/LoginButton";
import { ManageMenu } from "../components/ManageMenu";
import NavBar, {
  NavBarActionContainer,
  NavBarContent,
} from "../components/NavBar";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { UserAvatar } from "../components/UserAvatar";
import { routes } from "../routes";

import type { UserRole } from "../shared/roles";
import { getUserRoles } from "../shared/roles";
import "../styles/globals.css";
import { GlobalStyle } from "../styles/GlobalStyles";
import ThemeProvider from "../styles/ThemeProvider";
import { GlobalStateProvider } from "../utils/GlobalState/GlobalStateProvider";
import { trpc } from "../utils/trpc";

export const montserrat = Montserrat({
  weight: "variable",
  subsets: ["latin"],
  preload: true,
  // variable: "--font-montserrat",
  display: "swap",
});

const MyApp: AppType<{
  session?: Session | null;
  roles?: UserRole[];
  profile?: GuildUser;
}> = ({ Component, pageProps: { session, roles, profile, ...pageProps } }) => {
  const router = useRouter();
  const isStandAlonePage = router.pathname === routes.PublicIssueOpen.path;

  return (
    <React.Fragment>
      <style jsx global>{`
        html {
          font-family: ${montserrat.style.fontFamily} !important;
        }
      `}</style>
      <React.Suspense>
        <GlobalStyle />
        <SessionProvider session={session}>
          <GlobalStateProvider
            initialState={{
              themeName: "dark",
              isLoading: true,
              user: {
                profile,
                roles,
              },
              issues: {
                searchFilters: {},
              },
              pullRequests: {
                searchFilters: {},
              },
            }}
          >
            <ThemeProvider>
              <Loader />

              <main className={montserrat.className}>
                <span className="fixed top-48 z-50 -rotate-90 text-xs font-semibold">
                  v1.3.2
                </span>

                <NavBar hide={isStandAlonePage}>
                  <HomeButton />

                  <NavBarContent />

                  <NavBarActionContainer>
                    <GLobalProfileLayer>
                      <NewIssueShortcut />
                      <UserAvatar />
                      <ManageMenu />
                    </GLobalProfileLayer>

                    <LoginButton />

                    <ThemeSwitcher />
                  </NavBarActionContainer>
                </NavBar>

                <AppContainer>
                  <Component {...pageProps} />
                </AppContainer>
              </main>
            </ThemeProvider>
          </GlobalStateProvider>
        </SessionProvider>
      </React.Suspense>
    </React.Fragment>
  );
};

MyApp.getInitialProps = async (context) => {
  if (context.ctx.req && typeof window === "undefined") {
    const session = await getSession({
      ctx: {
        req: context.ctx.req,
      },
    });

    if (session) {
      const prisma = new PrismaClient();

      const user = await prisma.user.findUnique({
        where: {
          id: session?.user?.id,
        },
        include: {
          GuildUser: true,
        },
      });

      const roles = await getUserRoles(session, prisma);

      return {
        session: null,
        pageProps: {
          profile: user?.GuildUser,
          roles,
          session,
        },
      };
    }
  }

  return {
    session: null,
  };
};

export default trpc.withTRPC(MyApp);
