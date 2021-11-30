import React from "react";
import styled from "styled-components";
import Image from "next/image";

import globalLayout from "../../globals/layout";
import { events } from "../../services";
import {
  hMorePressedEvent,
  hCreatePressedEvent,
} from "../../event-definitions";

import { Panel, PanelContent } from "../panel";
import { PanelPrompt } from "../panel-prompt";
import { PanelButtons } from "../panel-buttons";
import { Button, ButtonLink } from "../buttons";

/**
 * Component that allows the user to create a gift from the home sequence
 */

const GiftImg = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

interface Props {
  onMoreClick: () => void; // callback when "More" is clicked
  giftImgSrc: string;
  texts: any;
}

const HomeCreateGift: React.FC<Props> = ({ onMoreClick, texts }) => {
  function handleMoreClick() {
    events.track(hMorePressedEvent());
    onMoreClick();
  }

  function handleCreateClick() {
    events.track(hCreatePressedEvent());
  }

  return (
    <Panel>
      <PanelContent topPosition="top-quarter">
        <PanelPrompt padding="0%" hideImage={true}>
          <GiftImg>
            <Image
              src={globalLayout.giftImage}
              alt="Flaschenpost"
              layout="fill"
              objectFit="contain"
            />
          </GiftImg>
        </PanelPrompt>
      </PanelContent>

      <PanelButtons>
        <ButtonLink onClick={handleCreateClick} to="/create-gift">
          {texts.createText}
        </ButtonLink>
        <Button onClick={handleMoreClick}>{texts.moreText}</Button>
      </PanelButtons>
    </Panel>
  );
};

export { HomeCreateGift };
