import React, { useEffect } from "react";
import { useRouter } from "next/router";

/***
 * Detects when the page reloads/closes/moves away
 * Note: We do not detect or intefere with browser back as would be a bad user experience
 */

interface Props {
  enabled: boolean; // Enable or disable the whole control
  promptOnReloadAndClose?: boolean; // Prompts the user on reload and close
  promptOnRouterLinkClick?: boolean; // Prompts the user if they click a router link
  confirmationMessage?: string; // Optional confirmation message
}

const PageChangeDetect: React.FC<Props> = ({
  enabled = true,
  promptOnReloadAndClose = true,
  promptOnRouterLinkClick = true,
  confirmationMessage = "Bist du sicher, dass du die Seite verlassen willst?",
}) => {
  const router = useRouter();
  // prompt the user if they try and leave with unsaved changes
  useEffect(() => {
    if (!enabled) {
      return () => {};
    }
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return (e.returnValue = confirmationMessage);
    };
    const handleBrowseAway = () => {
      if (window.confirm(confirmationMessage)) return;
      router.events.emit("routeChangeError");
      throw "routeChange aborted.";
    };
    window.addEventListener("beforeunload", handleWindowClose);
    router.events.on("routeChangeStart", handleBrowseAway);
    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
      router.events.off("routeChangeStart", handleBrowseAway);
    };
  });

  return null;
};

export { PageChangeDetect };
