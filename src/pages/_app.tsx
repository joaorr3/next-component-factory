import "../styles/globals.css";
import { Montserrat } from "@next/font/google";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import React from "react";
import { AppContainer } from "../components/AppContainer";
import Loader from "../components/Loader";
import { LoginButton } from "../components/LoginButton";
import NavBar, {
  NavBarActionContainer,
  NavBarContent,
} from "../components/NavBar";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { UserAvatar } from "../components/UserAvatar";
import { GlobalStyle } from "../styles/GlobalStyles";
import ThemeProvider from "../styles/ThemeProvider";
import { GlobalStateProvider } from "../utils/GlobalState/GlobalStateProvider";
import { trpc } from "../utils/trpc";
import { HomeButton } from "../components/HomeButton";

const montserrat = Montserrat({
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
              <NavBar>
                <HomeButton />

                <NavBarContent />

                <NavBarActionContainer>
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
