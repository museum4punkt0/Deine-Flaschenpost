import React from "react";
import styled from "styled-components";
import Image from "next/image";

import globalLayout from "../../globals/layout";
import { global, fadeInUp } from "../../themes/global";

import { Panel, PanelContent } from "../panel";
import { PanelRound } from "../panel-round";
import { TextResize } from "./../text-resize";

/**
 * Open gift
 */

const GiftImage = styled.div`
  width: 60%;
  height: 60%;
  position: relative;
  margin: 0% auto 10%;
`;

const OpenPanel = styled.div`
  display: flex;
  flex-direction: column;
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
            <GiftImage>
              <Image
                src={content.giftIcon}
                alt="Flaschenpost"
                layout="fill"
                objectFit="contain"
              />
            </GiftImage>
            <OpenText>{content.openButtonText}</OpenText>
          </OpenPanel>
        </PanelRound>
      </PanelContent>
    </Panel>
  );
};
