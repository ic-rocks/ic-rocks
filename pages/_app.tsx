import "balloon-css";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Footer } from "../components/Footer";
import Nav from "../components/Nav/Navbar";
import { ONE_HOUR_MS } from "../lib/durations";
import useAuth from "../lib/hooks/useAuth";
import "../styles/index.css";
import "../styles/svg.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
      cacheTime: ONE_HOUR_MS,
      retry: false,
    },
  },
});

function App({ Component, pageProps }) {
  useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col items-center">
        <div className="flex flex-col justify-between min-h-screen w-full sm:max-w-screen-lg px-4">
          <main>
            <Nav />
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </div>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
