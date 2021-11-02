import React, { useState } from "react";
import Link from "next/link";
import styled from "styled-components";

import { events } from "../../services";
import {
  hGiftsCreatePressedEvent,
  hGiftsOpenMuseumGiftPressedEvent,
} from "../../event-definitions";

import globalLayout from "../../globals/layout";
import { museum } from "../../data";
import { global } from "../../themes/global";
import { getSessionRecipientLocation } from "../../utils/local";

import { InformationWindow } from "../modals/information-window";
import { HelpContent } from "../information/help";
import { PanelTitle } from "../panel-title";
import { TextResize } from "../text-resize";
import SvgAddCircle from "../svg/add-circle";
import SvgGift from "../svg/gift";
import SvgFeedback from "../svg/feedback";

/**
 * The gift home screen
 * Shows welcome message, gift pile, and create a gift
 */

// Message
const HeaderMessage = styled.div`
  margin: 3% auto 3%;
  width: 80%;
  text-align: center;
`;

const HeaderMessageTextResize = styled(TextResize)`
  line-height: 1.2;
`;

const OpenMuseumGift = styled.div`
  text-align: center;
`;
const OpenMuseumGiftSvg = styled.div`
  margin: 15% auto 1%;
  width: 30%;
`;
const FeedbackSvg = styled.div`
  margin: 15% auto 1%;
  width: 30%;
`;
const OpenYourGift = styled.div`
  line-height: 1.3;
  margin-bottom: 18%;
`;
const OpenYourGiftText = styled(TextResize)`
  margin: 0 auto;
  max-width: 70%;
`;
const FeedbackText = styled(TextResize)`
  margin: 0 auto;
  font-family: "open-sans", -apple-system, BlinkMacSystemFont, "Segoe UI",
    "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
    "Helvetica Neue", sans-serif;
`;

const PlusStyle = styled.div`
  margin: 4% auto 0;
  width: 30%;
  cursor: pointer;
`;

const HomeContent = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  width: 100%;
  color: ${(props) => props.color};
`;

const GiftsNotSent = styled.div`
  text-align: center;
  margin: 4% auto 5%; /* Extra spacing at the end to avoid clash with brower chrome */
  div {
    line-height: 1.3;
  }
`;

const CreateAGiftOfYourOwn = styled(TextResize)`
  margin: 0 auto;
  max-width: 70%;
`;

const LineSpacer = styled.div`
  margin: 2% 0 3% 0;
  border-bottom: 0.1vh solid ${(props) => props.color};
  width: 100%;
`;

const ReadMoreLink = styled.button`
  margin: 2% 0 0;
  font-family: ${global.fonts.title.family};
  font-weight: ${global.fonts.title.normal};
  color: ${(props) => props.color};
`;

const SectionTitle = styled(PanelTitle)`
  margin-bottom: 2%;
`;

const FeedbackSection = styled.div`
  margin: 7vh 0 7vh;
`;

/**
 * Home screen gifts top level component
 */

interface HomeGiftProps {
  curatedGiftId: string;
  content: any;
}

const HomeGifts: React.FC<HomeGiftProps> = ({ curatedGiftId, content }) => {
  // State
  const [helpIsOpen, setHelpIsOpen] = useState(false);

  // Prep for render
  const atMuseum = getSessionRecipientLocation() === "at-museum";
  return (
    <>
      {helpIsOpen && (
        <InformationWindow
          onClose={() => {
            setHelpIsOpen(false);
          }}
        >
          <HelpContent />
        </InformationWindow>
      )}

      <HomeContent color={content.textColor}>
        <HeaderMessage>
          <HeaderMessageTextResize textSize={42}>
            {content.headerMessage}
          </HeaderMessageTextResize>

          <ReadMoreLink
            onClick={() => {
              setHelpIsOpen(true);
            }}
            color={content.textColor}
          >
            <TextResize textSize={42}>{content.readMoreText}</TextResize>
          </ReadMoreLink>
        </HeaderMessage>

        <LineSpacer color={content.textColor} />

        {!atMuseum && (
          <SectionTitle textSize={42}>
            Wenn du jetzt im Museum bist...
          </SectionTitle>
        )}

        <GiftsNotSent>
          <Link href="/create-gift">
            <a onClick={() => events.track(hGiftsCreatePressedEvent())}>
              <PlusStyle>
                <SvgAddCircle />
              </PlusStyle>
              <CreateAGiftOfYourOwn textSize={42}>
                {content.addText}
              </CreateAGiftOfYourOwn>
            </a>
          </Link>
        </GiftsNotSent>

        <LineSpacer color={content.textColor} />

        <OpenMuseumGift>
          <Link href={globalLayout.curatedGiftUrl}>
            <a onClick={() => events.track(hGiftsOpenMuseumGiftPressedEvent())}>
              <OpenMuseumGiftSvg>
                <SvgGift colour="black" />
              </OpenMuseumGiftSvg>

              <OpenYourGift>
                <OpenYourGiftText textSize={42}>
                  {content.openMuseumGiftText + " " + globalLayout.museumName}
                </OpenYourGiftText>
              </OpenYourGift>
            </a>
          </Link>
        </OpenMuseumGift>

        <LineSpacer color={content.textColor} />

        <FeedbackSection>
          <ReadMoreLink color={content.textColor}>
            <a href={content.feedbackUrl} target="_blank" rel="noreferrer">
              <FeedbackSvg>
                <SvgFeedback colour="black" />
              </FeedbackSvg>
              <FeedbackText textSize={50}>{content.feedbackText}</FeedbackText>
            </a>
          </ReadMoreLink>
        </FeedbackSection>
      </HomeContent>
    </>
  );
};

export { HomeGifts };
