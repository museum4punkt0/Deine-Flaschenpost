import React from "react";
import styled from "styled-components";

import globalLayout from "../../globals/layout";
import { events } from "../../services";
import {
  hShowMuseumGiftPressedEvent,
  hCreateOwnPressedEvent,
} from "../../event-definitions";

import { setHasUnopenedMuseumGift } from "../../utils/local";

import { Panel, PanelContent } from "../panel";
import { PanelPrompt } from "../panel-prompt";
import { PanelButtons } from "../panel-buttons";
import { ButtonLink } from "../buttons";
import { TextResize } from "../text-resize";

/**
 * Component that informs the user they have a new gift, and asks if they want to open it
 */

const GiftImg = styled.div`
  margin-bottom: 1vh;
  width: 20%;
  position: relative;
`;

interface Props {
  curatedGiftId: string;
}

const HomeNewGift: React.FC<Props> = ({ curatedGiftId, texts }) => {
  function handleOpenGift() {
    events.track(hShowMuseumGiftPressedEvent());

    // Set that the museum gift is read
    setHasUnopenedMuseumGift(false);
  }

  function handleCreateYourOwn() {
    events.track(hCreateOwnPressedEvent());
  }

  return (
    <Panel>
      <PanelContent topPosition="top-quarter">
        <PanelPrompt background="solid-white">
          <TextResize textSize={50} style={{ color: globalLayout.promptColor }}>
            {texts.giftReceivedText + globalLayout.museumName}
          </TextResize>
        </PanelPrompt>
      </PanelContent>

      <PanelButtons>
        <ButtonLink onClick={handleCreateYourOwn} to="/create-gift">
          {texts.createGiftText}
        </ButtonLink>

        <ButtonLink onClick={handleOpenGift} to={globalLayout.curatedGiftUrl}>
          {texts.openGiftText}
        </ButtonLink>
      </PanelButtons>
    </Panel>
  );
};

export { HomeNewGift };
