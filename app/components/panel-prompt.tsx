import React from "react";
import Image from "next/image";
import styled from "styled-components";

import globalLayout from "../globals/layout";
import { fadeInUp } from "../themes/global";
import { PanelText } from "./panel-text";
import {
  PanelRound,
  PanelRoundBackgroundStyle,
  PanelRoundBorderStyle,
} from "./panel-round";
import { TextResize } from "./text-resize";

interface StyleProps {
  textColor: string;
}

const PanelPromptStyle = styled.div<StyleProps>`
  overflow: hidden;
  color: ${globalLayout.promptColor};
  margin: 0 auto;
  text-align: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  animation: ${fadeInUp};
`;

const PanelImageContainer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
`;

interface Props {
  text?: string; // Text to show
  textSize?: number; // Text size
  background?: PanelRoundBackgroundStyle; // Backgroud style
  border?: PanelRoundBorderStyle; // Border style
  padding?: string;
  onClick?: () => void; // Action to take when clicked
  hideImage?: boolean;
}

const PanelPrompt: React.FC<Props> = (props) => (
  <PanelRound
    background={props.background || "none"}
    border={props.border}
    padding={props.padding}
    onClick={props.onClick}
    hideImage={props.hideImage}
  >
    <PanelPromptStyle textColor={globalLayout.promptColor}>
      {/* support line breaks */}
      {props.text &&
        props.text.split("\n").map((item, key) => {
          return (
            <PanelText textSize={props.textSize} key={key}>
              {item}
            </PanelText>
          );
        })}
      {props.children}
    </PanelPromptStyle>
  </PanelRound>
);

export { PanelPrompt, PanelPromptStyle };
