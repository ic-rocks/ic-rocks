import Nav from "../components/nav";
import "../styles/index.css";

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Nav />
      <main className="flex flex-col items-center">
        <div className="sm:max-w-screen-lg sm:w-full px-4">
          <Component {...pageProps} />
        </div>
      </main>
    </div>
  );
}

export default MyApp;
