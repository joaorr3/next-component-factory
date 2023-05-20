import { Montserrat } from "@next/font/google";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
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
import "../styles/globals.css";
import { GlobalStyle } from "../styles/GlobalStyles";
import ThemeProvider from "../styles/ThemeProvider";
import { GlobalStateProvider } from "../utils/GlobalState/GlobalStateProvider";
import { trpc } from "../utils/trpc";

export const montserrat = Montserrat({
  weight: "variable",
  subsets: ["latin"],
  preload: true,
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  const isStandAlonePage = router.pathname === routes.PublicIssueOpen.path;

  return (
    <React.Suspense>
      <GlobalStyle />
      <SessionProvider session={session}>
        <GlobalStateProvider>
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
  );
};

export default trpc.withTRPC(MyApp);
