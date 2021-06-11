import React from "react";
import { Footer } from "../components/Footer";
import Nav from "../components/Nav/Navbar";
import "../styles/index.css";
import "../styles/svg.css";

function MyApp({ Component, pageProps }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col justify-between min-h-screen w-full sm:max-w-screen-lg px-4">
        <main>
          <Nav />
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default MyApp;
