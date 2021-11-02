import React from "react";

import { ErrorMessage } from "../components/messages/error-message";

const NotFound: React.FC = () => (
  <ErrorMessage message="Entschuldigung, diese Seite konnte nicht gefunden werden." />
);

export default NotFound;
