import React from "react";
import { Footer } from "../components/Footer";
import Nav from "../components/Nav/Navbar";
import "../styles/index.css";
import "../styles/svg.css";

function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 flex flex-col items-center">
        <div className="sm:max-w-screen-lg w-full px-4">
          <Component {...pageProps} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default MyApp;
