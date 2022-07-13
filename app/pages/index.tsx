import { useState, useEffect } from "react";
import styled from "styled-components";
import { Textfit } from "react-textfit";

import {
  fetchGlobalLayout,
  fetchMenuItems,
  fetchScreenTexts,
  fetchScreenContent,
} from "../services/content-provider";
import { config } from "../config";
import globalLayout from "../globals/layout";

import { museum } from "../data";
import { events } from "../services/index";
import { termsAcceptedEvent } from "../event-definitions";

import { GlobalStyles, global } from "../themes/global";
import HeadProvider from "../components/head-provider";
import { ScreenManager } from "../components/screen-manager";
import { TextResize } from "../components/text-resize";
import { ScreenHeader } from "../components/screen-header";
import { HomeIntro1 } from "../components/home/home-intro-1";
import { HomeIntro2 } from "../components/home/home-intro-2";
import { HomeNewGift } from "../components/home/home-new-gift";
import { HomeCreateGift } from "../components/home/home-create-gift";
import { HomeGifts } from "../components/home/home-gifts";
import { FeedbackModal } from "../components/modals/feedback-modal";

import { BackgroundSvg } from "../components/background-svg";
import {
  getHasSeenHomeIntro,
  setHasSeenHomeIntro,
  getHasUnopenedMuseumGift,
  getSessionRecipientLocation,
  setSessionRecipientLocation,
  getUserHasAgreedTerms,
} from "../utils/local";

/**
 * Component that manages the home intro sequence
 * All screen state logic is in here, with the layout in the components
 */

export const MainTitle = styled(TextResize).attrs((props) => ({
  //textSize: 320,
  textSize: props.textSize ?? 200,
}))`
  z-index: 1;
  text-align: center;
  font-family: ${global.fonts.title.family};
  font-weight: ${global.fonts.title.bold};
  margin: 7vh 0 0;
  color: white;
`;

const MainTitleContainer = styled.div`
  width: 100%;
  z-index: 1;
  text-align: center;
  font-family: ${global.fonts.title.family};
  font-weight: ${global.fonts.title.bold};
  margin-top: 3rem;
  position: relative;
  color: white;
  padding: 0 10px;
`;

export const MuseumName = styled(TextResize).attrs({
  textSize: 40,
})`
  z-index: 1;
  width: 90%;
  text-align: center;
  font-family: ${global.fonts.subtitle.family};
  font-weight: ${global.fonts.subtitle.weight};
  line-height: 0.9;
  color: white;
`;

export const MainTitleSmall = styled(TextResize).attrs({
  //textSize: 160,
  textSize: 100,
})`
  z-index: 1;
  text-align: center;
  font-family: ${global.fonts.title.family};
  font-weight: ${global.fonts.title.bold};
  margin: 2vh 0 0.5vh;
  color: white;
`;

export const MuseumNameSmall = styled(TextResize).attrs({
  textSize: 35,
})`
  z-index: 1;
  width: 90%;
  text-align: center;
  font-family: ${global.fonts.subtitle.family};
  font-weight: ${global.fonts.subtitle.weight};
  line-height: 0.9;
  margin: 0 0 1vh 0;
  color: white;
`;

// Current status of this screen
type Status =
  | "none"
  | "intro1"
  | "intro2"
  | "how-about"
  | "got-new-gift"
  | "create-gift"
  | "show-gifts";

interface Props {
  title: string;
  titleSize: Number;
}

const HomeScreen: React.FC<Props> = (props) => {
  // State
  const [status, setStatus] = useState<Status>("none");
  const [showFeedback, setShowFeedback] = useState(false);

  // Default to the stored state
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

  const curatedGiftId = museum.curatedGiftId;
  let feedbackTimer: number;

  function hideFeedbackModal() {
    setShowFeedback(false);
  }

  // Resets the timer used to show the feedback dialog if we have a time of inactivity
  function resetFeedbackTimer() {
    window.clearTimeout(feedbackTimer);
    feedbackTimer = window.setTimeout(() => {
      setShowFeedback(true);
    }, 2 * 60 * 1000);
  }

  // Takes the desired status and takes the user to the correct point
  // They have have seen the desired panel, so push forward to the next one
  function showNextScreen(nextStatus: Status) {
    // Reset the feedback timer on each change, to ensure it only appears after inactivity
    // Only reset after the terms have been accepted
    if (termsAccepted) resetFeedbackTimer();

    if (nextStatus === "intro1") {
      // Have we already seen the intro?
      getHasSeenHomeIntro()
        ? showNextScreen("got-new-gift")
        : setStatus("intro1");
    } else if (nextStatus === "intro2") {
      setStatus("intro2");
    } else if (nextStatus === "how-about") {
      setStatus("how-about");
    } else if (nextStatus === "got-new-gift") {
      setHasSeenHomeIntro(true);

      // Do we have an unopened museum gift? (And are we supposed to show it?)
      if (getHasUnopenedMuseumGift() && museum.homeScreenShowCuratedGift) {
        // Go to start
        setStatus("got-new-gift");
      } else {
        // Go to the home screen
        setStatus("create-gift");
      }
    } else {
      // Safety net
      setStatus("none");
    }
  }

  // Clear the timeout on unmount
  useEffect(() => {
    setTermsAccepted(getUserHasAgreedTerms());

    // Start, default to first screen
    if (status === "none") {
      // Set start point based on museum
      museum.homeScreenStartPoint === "ever-made-a-mixtape"
        ? showNextScreen("intro1")
        : museum.homeScreenStartPoint === "new-gift"
        ? showNextScreen("got-new-gift")
        : noop();
    }

    // If visitor location has not been set, set default to at the museum
    if (getSessionRecipientLocation() === "unknown") {
      setSessionRecipientLocation("at-museum");
    }

    return () => {
      window.clearTimeout(feedbackTimer);
    };
  }, []);

  // Determine header style
  const homeHeader = status === "show-gifts";
  const allowScroll = status === "show-gifts";

  const showLogo = status !== "show-gifts";

  function handleTermsAccepted() {
    events.track(termsAcceptedEvent());
    resetFeedbackTimer();
  }

  return (
    <HeadProvider>
      <ScreenManager allowScroll={allowScroll}>
        <BackgroundSvg bg={globalLayout.backgroundImage} />
        <GlobalStyles />

        {/* Header */}
        <ScreenHeader
          padding="none"
          onTermsAccepted={handleTermsAccepted}
          menuItems={props.menuItems}
          showLogo={showLogo}
        />

        {/* Title */}
        {homeHeader && (
          <>
            <MainTitleSmall>{globalLayout.appTitle}</MainTitleSmall>
            <MuseumNameSmall>{globalLayout.appCaption}</MuseumNameSmall>
          </>
        )}
        {!homeHeader && (
          <>
            <MainTitleContainer>
              <Textfit mode="single">{globalLayout.appTitle}</Textfit>
            </MainTitleContainer>
            <MuseumName>{globalLayout.appCaption}</MuseumName>
          </>
        )}

        {/* Content */}
        {status === "intro1" && !termsAccepted && (
          <HomeIntro1
            onComplete={() => {
              setStatus("intro2");
            }}
            texts={props.screenHomeIntro1}
          />
        )}
        {status === "intro1" && termsAccepted && (
          <HomeIntro1
            onComplete={() => {
              setStatus("intro2");
            }}
            texts={props.screenHomeIntro1}
          />
        )}

        {status === "intro2" && (
          <HomeIntro2
            onComplete={() => {
              showNextScreen("got-new-gift");
            }}
            texts={props.screenHomeIntro2}
          />
        )}

        {status === "got-new-gift" && (
          <HomeNewGift
            curatedGiftId={curatedGiftId}
            texts={props.screenHomeNewGift}
          />
        )}

        {status === "create-gift" && (
          <HomeCreateGift
            onMoreClick={() => {
              setStatus("show-gifts");
            }}
            texts={props.screenHomeCreateGift}
          />
        )}

        {status === "show-gifts" && (
          <HomeGifts
            curatedGiftId={curatedGiftId}
            content={props.screenHomeMore}
          />
        )}

        {showFeedback && false && (
          <FeedbackModal
            feedbackUrl={museum.feedbackUrl}
            feedbackText={museum.feedbackText}
            onFinished={hideFeedbackModal}
          />
        )}
      </ScreenManager>
    </HeadProvider>
  );
};

const noop = () => {};

export default HomeScreen;

export async function getStaticProps(context) {
  const globalLayout = await fetchGlobalLayout();
  const menuItems = await fetchMenuItems();
  const screenHomeCreateGift = await fetchScreenTexts(
    "screen-home-create-gift"
  );
  const screenHomeIntro1 = await fetchScreenTexts("screen-home-intro-1");
  const screenHomeIntro2 = await fetchScreenTexts("screen-home-intro-2");
  const screenHomeNewGift = await fetchScreenTexts("screen-home-new-gift");
  const screenHomeMore = await fetchScreenContent("screen-home-more");
  return {
    props: {
      globalLayout: globalLayout,
      menuItems: menuItems,
      screenHomeCreateGift: screenHomeCreateGift,
      screenHomeIntro1: screenHomeIntro1,
      screenHomeIntro2: screenHomeIntro2,
      screenHomeNewGift: screenHomeNewGift,
      screenHomeMore: screenHomeMore,
    },
    revalidate: config.revalidateTime,
  };
}
