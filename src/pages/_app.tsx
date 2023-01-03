import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { trpc } from "../utils/trpc";

import React from "react";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { GlobalStyle } from "../styles/GlobalStyles";
import ThemeProvider from "../styles/ThemeProvider";
import { type ThemeNames } from "../theme";
import LoadingProvider from "../utils/LoadingProvider";
import { useLocalStorage } from "../hooks/useLocalStorage";
import NavBar from "../components/NavBar";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [themeName, setThemeName] = useLocalStorage<ThemeNames | null>(
    "currentTheme",
    null
  );

  return (
    <React.Suspense>
      <SessionProvider session={session}>
        <ThemeProvider themeName={themeName}>
          <LoadingProvider>
            <GlobalStyle />
            <NavBar>
              <ThemeSwitcher
                initial={themeName}
                onChange={(next) => setThemeName(next)}
              />
            </NavBar>

            <Component {...pageProps} />
          </LoadingProvider>
        </ThemeProvider>
      </SessionProvider>
    </React.Suspense>
  );
};

export default trpc.withTRPC(MyApp);
