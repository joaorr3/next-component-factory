import { Montserrat } from "@next/font/google";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import React from "react";
import { AppContainer } from "../components/AppContainer";
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
  return (
    <React.Suspense>
      <GlobalStyle />
      <SessionProvider session={session}>
        <GlobalStateProvider>
          <ThemeProvider>
            <Loader />

            <main className={montserrat.className}>
              <span className="fixed top-48 z-50 -rotate-90 text-xs font-semibold">
                v1.0.0
              </span>

              <NavBar>
                <HomeButton />

                <NavBarContent />

                <NavBarActionContainer>
                  <NewIssueShortcut />

                  <ManageMenu />

                  <UserAvatar />
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
