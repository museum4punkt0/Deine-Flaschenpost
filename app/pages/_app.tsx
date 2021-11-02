//import '../styles/globals.css'
import type { AppProps } from "next/app";
import Head from "next/head";
import globalLayout from "../globals/layout";
import menu from "../globals/menu";

function MyApp({ Component, pageProps }: AppProps) {
  Object.assign(globalLayout, pageProps.globalLayout);
  Object.assign(menu, { items: pageProps.menuItems });
  return <Component {...pageProps} />;
}
export default MyApp;
