import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";

import globalLayout from "../../globals/layout";
import { InProgressGift, Gift, MuseumId } from "../../domain";

import { events } from "../../services";
import {
  cNewGiftStartedEvent,
  cIntroCompletedEvent,
  cRecipientNameEnteredEvent,
  cSigningCompletedEvent,
  cSharingCompletedEvent,
  cSharingChannelChosenEvent,
} from "../../event-definitions";

import { PageChangeDetect } from "../messages/page-change-detect";
import { GlobalStyles, global } from "../../themes/global";
import { BackgroundSvg } from "../background-svg";
import { ScreenManager } from "../screen-manager";
import { ScreenHeader } from "../screen-header";
import { TextResize } from "../text-resize";

import { CreateGiftIntro } from "../creating/intro";
import { CreateGiftChooseRecipient } from "../creating/choose-recipient";
import { CreatingPartContent } from "../creating/part-content";
import { SignGift } from "../creating/sign-gift";
import { SaveGift } from "../creating/save-gift";
import { ShareGift } from "../creating/share-gift";
import { CreatingOutro } from "../creating/outro";

/**
 * Gift Create screen top level component
 */

export const MainTitleStyle = styled(TextResize).attrs({
  textSize: 140,
})`
  z-index: 1;
  width: 90%;
  text-align: center;
  font-family: ${global.fonts.title.family};
  font-weight: ${global.fonts.title.bold};
  line-height: 0.9;
  margin: 2vh 0 0;
  padding-bottom: 10px;
  color: ${(props) => props.color};
  @media (max-height: 600px) {
    font-size: 10vw;
  }
`;

const MainTitle = ({ children, ...rest }) => (
  <MainTitleStyle color={globalLayout.titleColor} {...rest}>
    {children}
  </MainTitleStyle>
);

export const SubtitleStyle = styled(TextResize).attrs({
  textSize: 55,
})`
  z-index: 1;
  width: 90%;
  text-align: center;
  font-family: ${global.fonts.subtitle.family};
  font-weight: ${global.fonts.subtitle.weight};
  line-height: 0.9;
  color: ${(props) => props.color};
`;

const SubTitle = ({ children, ...rest }) => (
  <SubtitleStyle color={globalLayout.titleColor} {...rest}>
    {children}
  </SubtitleStyle>
);

// Current status of this screen
type Status =
  | "intro"
  | "choose-recipient"
  | "creating-part"
  | "sign-gift"
  | "save-gift"
  | "share-gift"
  | "outro";

interface Props {
  museumId: MuseumId;
  content: any;
}

export const CreateGift: React.FC<Props> = ({ museumId, content }) => {
  const [status, setStatus] = useState<Status>("intro");
  const [newGift, setNewGift] = useState<Gift | null>(null); // TODO: TEMP: refactor

  const [gift, setGift] = useState<InProgressGift>({
    id: uuidv4(),
    museumId,
    parts: [],
  });

  useEffect(() => {
    events.track(cNewGiftStartedEvent(gift.id));
  }, []);

  const headerState =
    status === "intro" || status === "choose-recipient"
      ? "name-unknown"
      : "named-small";

  // Shall we allow navigation away based on the current state
  function canNavigateAway() {
    return status === "outro";
  }

  return (
    <ScreenManager>
      <BackgroundSvg bg={globalLayout.backgroundImage} />
      <GlobalStyles />
      <PageChangeDetect
        enabled={!canNavigateAway()}
        confirmationMessage={content.global.cancelMessage}
      />

      {/* Header */}
      {headerState === "name-unknown" && (
        <>
          <ScreenHeader showLogo={true} />
          {status !== "sign-gift" && status !== "save-gift" && (
            <MainTitle>{content.global.header}</MainTitle>
          )}
        </>
      )}

      {headerState === "named-small" && (
        <>
          <ScreenHeader
            preSubTitle={content.global.headerNamed}
            subTitle={gift.recipientName}
            showLogo={true}
          />
          {status !== "sign-gift" && status !== "save-gift" && (
            <>
              <SubTitle>{content.global.headerNamed}</SubTitle>
              <MainTitle>{gift.recipientName}</MainTitle>
            </>
          )}
        </>
      )}

      {/* Content */}
      {status === "intro" && (
        <CreateGiftIntro
          onComplete={() => {
            events.track(cIntroCompletedEvent(gift.id));
            setStatus("choose-recipient");
          }}
          texts={content.intro}
        />
      )}

      {status === "choose-recipient" && (
        <CreateGiftChooseRecipient
          giftId={gift.id}
          onComplete={(recipientName) => {
            events.track(cRecipientNameEnteredEvent(gift.id));
            setGift({ ...gift, recipientName });
            setStatus("creating-part");
          }}
          content={content.chooseRecipient}
        />
      )}

      {status === "creating-part" && gift.recipientName !== undefined && (
        <CreatingPartContent
          gift={gift}
          recipientName={gift.recipientName}
          content={content.parts}
          onComplete={(parts) => {
            setGift({ ...gift, parts });
            setStatus("sign-gift");
          }}
        />
      )}

      {status === "sign-gift" && (
        <SignGift
          content={content.sign}
          onComplete={(senderName) => {
            events.track(cSigningCompletedEvent(gift.id));
            setGift({ ...gift, senderName });
            setStatus("save-gift");
          }}
          recipientName={gift.recipientName}
        />
      )}

      {status === "save-gift" && (
        <SaveGift
          gift={gift}
          onComplete={(newlyCreatedGift) => {
            setNewGift(newlyCreatedGift);
            setStatus("share-gift");
          }}
          content={content.save}
        />
      )}

      {status === "share-gift" && newGift && (
        <ShareGift
          senderName={newGift.senderName}
          recipientName={newGift.recipientName}
          url={mkShareLink(newGift)}
          onChannelClicked={(channel) => {
            events.track(cSharingChannelChosenEvent(gift.id, channel));
          }}
          onComplete={() => {
            events.track(cSharingCompletedEvent(gift.id));
            setStatus("outro");
          }}
          content={content.share}
        />
      )}

      {status === "outro" && (
        <CreatingOutro gift={gift} content={content.outro} />
      )}
    </ScreenManager>
  );
};

// TODO!!!
function mkShareLink(gift: Gift) {
  return `${window.location.protocol}//${window.location.host}/gift/${gift.id}`;
}
