import React from "react";
import styled from "styled-components";

import globalLayout from "../../globals/layout";
import { global, fadeInUp } from "../../themes/global";

import { Panel, PanelContent } from "../panel";
import { PanelRound } from "../panel-round";
import { TextResize } from "./../text-resize";
import SvgGift from "../svg/gift";

/**
 * Open gift
 */

const GiftImage = styled.div`
  width: 70%;
  margin: 7% auto 0;
`;

const OpenPanel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin: 0 auto;
  width: 100%;
  animation: ${fadeInUp};
`;

const OpenTextStyle = styled(TextResize).attrs({
  textSize: 60,
})`
  font-style: italic;
  font-family: ${global.fonts.title.family};
  position: relative;
  top: -5%; // nudge up because of svg spacing
  color: ${(props) => props.color};
`;

const OpenText = ({ children, ...rest }) => (
  <OpenTextStyle color={globalLayout.promptColor} {...rest}>
    {children}
  </OpenTextStyle>
);

export interface Props {
  onComplete: () => void;
  content: any;
}

export const ReceivingOpenGift: React.FC<Props> = ({ onComplete, content }) => {
  return (
    <Panel>
      <PanelContent>
        <PanelRound
          border={"none"}
          background={"solid-white"}
          onClick={onComplete}
        >
          <OpenPanel>
            {/* TODO?
            <GiftImage>
              <SvgGift colour="black" />
            </GiftImage>
              */}
            <OpenText>{content.openButtonText}</OpenText>
          </OpenPanel>
        </PanelRound>
      </PanelContent>
    </Panel>
  );
};
