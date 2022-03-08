import React from "react";
import styled from "styled-components";

import globalLayout from "../../globals/layout";
import { GlobalStyles } from "../../themes/global";
import { Buttons, ButtonAnchor, ButtonLink } from "../buttons";
import { ScreenMessage } from "./screen-message";
import { ScreenManager } from "../screen-manager";
import { TextResize } from "../text-resize";
import { BackgroundSvg } from "../../components/background-svg";

/**
 * Error Message component
 * This will be shown instead of any other content
 */

interface Props {
  message: string;
}

const DeviceButtons = styled(Buttons)`
  position: absolute;
  bottom: 0;
  left: 0;
`;

const ErrorTextResize = styled(TextResize)`
  margin-bottom: 1vh;
`;

const ErrorMessage: React.FC<Props> = ({ message }) => {
  return (
    <ScreenManager>
      <ScreenMessage>
        <GlobalStyles />

        <ErrorTextResize>{message}</ErrorTextResize>

        <ErrorTextResize>
          Abbrechen um zur Startseite zurückzukehren
        </ErrorTextResize>

        <DeviceButtons>
          <ButtonLink colour="white" to="/">
            Abbrechen
          </ButtonLink>
          <ButtonAnchor
            colour="white"
            href={typeof window !== "undefined" ? window.location.href : ""}
          >
            Nochmal versuchen
          </ButtonAnchor>
        </DeviceButtons>
      </ScreenMessage>
    </ScreenManager>
  );
};

export { ErrorMessage };
