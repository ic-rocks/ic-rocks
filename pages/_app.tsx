import Nav from "../components/Nav";
import "../styles/index.css";

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Nav />
      <main className="flex flex-col items-center">
        <div className="sm:max-w-screen-lg w-full px-4">
          <Component {...pageProps} />
        </div>
      </main>
    </div>
  );
}

export default MyApp;
