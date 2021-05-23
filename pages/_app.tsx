import "../styles/index.css";
import Nav from "../components/nav";

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Nav />
      <main className="flex flex-col items-center">
        <div className="sm:max-w-screen-lg sm:w-full">
          <Component {...pageProps} />
        </div>
      </main>
    </div>
  );
}

export default MyApp;
