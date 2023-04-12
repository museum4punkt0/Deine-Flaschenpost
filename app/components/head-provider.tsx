import Head from "next/head";
import globalLayout from "../globals/layout";

const HeadProvider: React.FC = ({ children }) => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="manifest.webmanifest" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=1.0, user-scalable=0"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={globalLayout.appleTouchIcon}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="48x48"
          href={globalLayout.favicon48x48}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={globalLayout.favicon32x32}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={globalLayout.favicon16x16}
        />
        <link rel="stylesheet" href="https://use.typekit.net/ajv1qmr.css" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <meta property="og:image" content={globalLayout.openGraphImage} />
        <script type="module" src="https://www.deutsches-meeresmuseum.de/assets/flaschenpost/data-consent.js?v=1"></script>
        <title>{globalLayout.appTitle}</title>
      </Head>
      {children}
    </>
  );
};

export default HeadProvider;
