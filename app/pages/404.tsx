import React from "react";

import {
  fetchGlobalLayout,
  fetchMenuItems,
} from "../services/content-provider";
import { config } from "../config";

import { ErrorMessage } from "../components/messages/error-message";

const NotFound: React.FC = () => (
  <ErrorMessage message="Entschuldigung, diese Seite konnte nicht gefunden werden." />
);

export default NotFound;

export async function getStaticProps(context) {
  const globalLayout = await fetchGlobalLayout();
  const menuItems = await fetchMenuItems();
  return {
    props: {
      globalLayout: globalLayout,
      menuItems: menuItems,
    },
    revalidate: config.revalidateTime,
  };
}
