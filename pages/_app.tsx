import "balloon-css";
import React from "react";
import { Footer } from "../components/Footer";
import Nav from "../components/Nav/Navbar";
import { StateProvider } from "../components/StateContext";
import useAuth from "../lib/hooks/useAuth";
import "../styles/index.css";
import "../styles/svg.css";

function App({ Component, pageProps }) {
  useAuth();

  return (
    <StateProvider>
      <div className="flex flex-col items-center">
        <div className="flex flex-col justify-between min-h-screen w-full sm:max-w-screen-lg px-4">
          <main>
            <Nav />
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </div>
    </StateProvider>
  );
}

export default App;
