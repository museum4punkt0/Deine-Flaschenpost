import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

import styled from "styled-components";
import { useRouter } from "next/router";

import { events } from "../../../services";
import {
  rPartCluePressedEvent,
  rPartClueDismissedEvent,
  rPartHelpPressedEvent,
  rPartHelpDismissedEvent,
  rPartCompletedEvent,
  rPartFound,
  rOutroCompletedEvent,
} from "../../../event-definitions";

import { Panel, PanelContent } from "../../panel";
import { PanelPrompt } from "../../panel-prompt";
import { PanelText } from "../../panel-text";
import { PanelButtons } from "../../panel-buttons";
import { Button } from "../../buttons";
import { AudioPlayer } from "../../media/audio-player";
import { AudioTranscription } from "../../media/audio-transcription";
import { RecipientLocation } from "../../choose-location";
import { Gift, GiftPart } from "../../../domain";
import { WaitThen, WaitThenShow } from "../../utils/wait-then";
import SvgIconDone from "../../svg/icon-done";

/**
 * Show the gift part content, prompting for clues, etc.
 */

const DoneIconWrap = styled.div`
  width: 20%;
  position: relative;
`;

export interface PartContentProps {
  gift: Gift; // The gift in question, as we need some other info (part count, sender name)
  giftPartIndex: number; // The index of this gift part
  recipientLocation: RecipientLocation; // At the museum or not
  onComplete?: () => void; // Callback to call when complete
  revealPreviewImage: () => void; // Callback reveal the preview circle
  revealBackgroundImage: () => void; // Callback reveal the entire background image
  content: any;
}

type Section =
  | "start"
  | "reveal-preview2"
  | "show-clue-search"
  | "need-help"
  | "help-is-here"
  | "reveal-full"
  | "play-audio"
  | "show-clue-found"
  | "unwrapped"
  | "outro";

const ReceivingPartContent: React.FC<PartContentProps> = (props) => {
  const [section, setSection] = useState<Section>("start");
  const [audioPlaybackComplete, setAudioPlaybackComplete] = useState(false);
  const [outroAudioPlaybackFinished, setOutroAudioPlaybackFinished] =
    useState(false);

  // Get some local references
  const giftPart: GiftPart = props.gift.parts[props.giftPartIndex];
  const giftPartCount: number = props.gift.parts.length;
  const giftSenderName: string = props.gift.senderName;
  const atMuseum = props.recipientLocation === "at-museum";
  const museumGift = props.gift.kind === "MuseumGift";

  const router = useRouter();

  const content = props.content;

  for (let key of Object.keys(content)) {
    if (typeof content[key] === "string") {
      content[key] = content[key].replace("${giftSenderName}", giftSenderName);
    }
  }

  // Our audio player has finished
  function handleAudioPlaybackFinished() {
    setAudioPlaybackComplete(true);
  }

  // Show the preview image circle
  function revealPreviewImage() {
    // Fire the call back
    if (props.revealPreviewImage) {
      props.revealPreviewImage();
    }

    // Set our section
    setSection("reveal-preview2");
  }

  function gotoSneakPeek() {
    setSection("start");
  }

  function gotoGiveClueSearch() {
    // Record the event
    events.track(rPartCluePressedEvent(props.gift.id, props.giftPartIndex + 1));

    // Show the section
    setSection("show-clue-search");
  }

  function gotoGiveHelp() {
    setSection("need-help");
  }

  function gotoHereYouGo() {
    // Record the event
    events.track(rPartFound(props.gift.id, props.giftPartIndex + 1));

    // Show the section
    setSection("help-is-here");
  }

  function gotoFound() {
    if (props.revealBackgroundImage) {
      props.revealBackgroundImage();
    }
    setSection("reveal-full");
  }

  function gotoFoundAudio() {
    setSection("play-audio");
  }

  function gotoOutro() {
    setSection("unwrapped");
  }

  function gotoEndOfGiftPart() {
    events.track(rPartCompletedEvent(props.gift.id, props.giftPartIndex + 1));

    // If on the last part show the outro
    const lastGiftPart = props.giftPartIndex + 1 === giftPartCount;
    if (lastGiftPart) {
      gotoOutro();
    } else {
      // Callback
      if (props.onComplete) {
        props.onComplete();
      }
    }
  }

  function handleOutroContinue() {
    // Track go home event
    events.track(rOutroCompletedEvent(props.gift.id));

    // Go to the home screen
    router.push("/");
  }

  // Advanced to the next status/screen
  function handleContinue() {
    if (section === "start") {
      if (atMuseum) {
        revealPreviewImage();
      } else {
        // If not at the museum jump straight to the reveal
        if (props.revealBackgroundImage) {
          props.revealBackgroundImage();
        }
        setSection("reveal-full");
      }
    }

    if (section === "reveal-preview2") {
      // Check if we have a clue
      if (giftPart && giftPart.clue.trim()) {
        setSection("need-help");
      } else {
        setSection("show-clue-search");
      }
    }

    if (section === "show-clue-search") {
      setSection("need-help");
    }
    if (section === "need-help") {
      setSection("help-is-here");
    }
    if (section === "help-is-here") {
      setSection("reveal-full");
    }
    if (section === "reveal-full") {
      setSection("play-audio");
    }
    if (section === "play-audio") {
      setSection("show-clue-found");
    }
    if (section === "show-clue-found") {
      setSection("unwrapped");
    }
    if (section === "unwrapped") {
      setSection("outro");
    }
  }

  function getButtons() {
    // Is there a part after this one
    const furtherPart = giftPartCount > props.giftPartIndex + 1;

    // Check if we have a clue
    const haveClue = giftPart && giftPart.clue.trim();

    switch (section) {
      case "reveal-preview2":
        return (
          <>
            {haveClue && (
              <Button onClick={gotoGiveClueSearch}>
                {content.clueButtonText}
              </Button>
            )}
            {!haveClue && (
              <Button onClick={gotoGiveHelp}>{content.helpButtonText}</Button>
            )}
            <Button onClick={gotoHereYouGo} primary={true}>
              {content.foundButtonText}
            </Button>
          </>
        );

      case "show-clue-search":
        return (
          <>
            <Button onClick={gotoSneakPeek} primary={true}>
              {content.okButtonText}
            </Button>
            <Button
              onClick={() => {
                events.track(
                  rPartHelpPressedEvent(props.gift.id, props.giftPartIndex + 1)
                );
                gotoGiveHelp();
              }}
            >
              {content.moreHelpButtonText}
            </Button>
          </>
        );
      case "need-help": // More help
        return (
          <Button
            onClick={() => {
              events.track(
                rPartHelpDismissedEvent(props.gift.id, props.giftPartIndex + 1)
              );
              gotoSneakPeek();
            }}
            primary={true}
          >
            {content.okButtonText}
          </Button>
        );
      case "reveal-full":
        // If at the museum, auto continue, therefore no buttons
        if (props.recipientLocation === "at-museum") return null;

        // If not at the museum show the buttons
        return (
          <WaitThenShow wait={1}>
            <Button onClick={handleContinue} primary={true}>
              {content.continueButtonText}
            </Button>
          </WaitThenShow>
        );
      case "play-audio":
        // Different text based on gift part
        // Note: This is never shown on the last part, so no need to consider that case
        const openPartText =
          props.giftPartIndex === 1
            ? content.openLastPartText
            : content.openPartTwoText;

        return (
          <>
            {audioPlaybackComplete && furtherPart && (
              <Button onClick={gotoEndOfGiftPart} primary={true}>
                {openPartText}
              </Button>
            )}
            {audioPlaybackComplete && !furtherPart && (
              <Button onClick={gotoEndOfGiftPart} primary={true}>
                {content.doneButtonText}
              </Button>
            )}
          </>
        );
      case "show-clue-found":
        return (
          <Button
            onClick={() => {
              events.track(
                rPartClueDismissedEvent(props.gift.id, props.giftPartIndex + 1)
              );
              gotoFoundAudio();
            }}
            primary={true}
          >
            {content.okButtonText}
          </Button>
        );
      case "outro":
        return (
          <>
            {outroAudioPlaybackFinished && (
              <Button primary={true} onClick={handleOutroContinue}>
                {content.doneButtonText}
              </Button>
            )}
          </>
        );
      default:
        return null;
    }
  }

  function getIntroText() {
    // Show different text if at museum

    if (atMuseum) {
      switch (props.giftPartIndex) {
        case 0:
          // Text changes based on gift count
          return giftPartCount === 1
            ? content.previewTextPartOneSingleAtMuseum
            : content.previewTextPartOneMultiAtMuseum;
        case 1:
          return content.previewTextPartTwoAtMuseum;
        case 2:
          return content.previewTextPartThreeAtMuseum;
        default:
          return "";
      }
    } else {
      // Not at museum

      switch (props.giftPartIndex) {
        case 0:
          // Text changes based on gift count
          return giftPartCount === 1
            ? content.previewTextPartOneSingleNotAtMuseum
            : content.previewTextPartOneMultiNotAtMuseum;
        case 1:
          return content.previewTextPartTwoNotAtMuseum;
        case 2:
          return content.previewTextPartThreeNotAtMuseum;
        default:
          return "";
      }
    }
  }

  function getNeedHelpText() {
    switch (props.giftPartIndex) {
      case 0:
        return content.needHelpTextPartOne;
      case 1:
        return content.needHelpTextPartTwo;
      case 2:
        return content.needHelpTextPartThree;
      default:
        return "";
    }
  }

  function getPreFindText() {
    switch (props.giftPartIndex) {
      case 0:
        return content.preFindTextPartOne;
      case 1:
        return content.preFindTextPartTwo;
      case 2:
        return content.preFindTextPartThree;
      default:
        return "";
    }
  }

  function getPlaySendersMessage() {
    switch (props.giftPartIndex) {
      case 0:
        // Text changes based on gift count and sender name
        return giftPartCount > 1
          ? content.playSendersMsgTextPartOneMulti
          : content.playSendersMsgTextPartOneSingle;
      case 1:
        return content.playSendersMsgTextPartTwo;
      case 2:
        return content.playSendersMsgTextPartThree;
      default:
        return "";
    }
  }

  function getOutroAudioFile() {
    return atMuseum
      ? museumGift
        ? content.outroAudioAtMuseumMuseumGift
        : content.outroAudioAtMuseumPersonalGift
      : // not at museum
      museumGift
      ? content.outroAudioNotAtMuseumMuseumGift
      : content.outroAudioNotAtMuseumPersonalGift;
  }

  function getOutroAudioTranscript() {
    return (
      <ReactMarkdown>
        {atMuseum
          ? museumGift
            ? content.outroAudioTranscriptAtMuseumMuseumGift
            : content.outroAudioTranscriptAtMuseumPersonalGift
          : // not at museum
          museumGift
          ? content.outroAudioTranscriptNotAtMuseumMuseumGift
          : content.outroAudioTranscriptNotAtMuseumPersonalGift}
      </ReactMarkdown>
    );
  }

  return (
    <Panel isParent={false}>
      {/* Audio transcriptions live outside of the PanelContent for layout purposes */}
      {section === "outro" && (
        <AudioTranscription
          giftId={props.gift.id}
          audioReference={`r-part${props.giftPartIndex + 1}-outro`}
        >
          {getOutroAudioTranscript()}
        </AudioTranscription>
      )}

      <PanelContent>
        {section === "start" && (
          <>
            <PanelPrompt
              text={getIntroText()}
              background={"transparent-black"}
              onClick={handleContinue}
            />
            {props.recipientLocation === "at-museum" && (
              <WaitThen wait={4} andThen={handleContinue} />
            )}
            {props.recipientLocation !== "at-museum" && (
              <WaitThen wait={3} andThen={handleContinue} />
            )}
          </>
        )}

        {/* reveal-preview2 - nothing to show */}

        {section === "show-clue-search" && (
          <PanelPrompt text={giftPart.clue} background={"transparent-black"} />
        )}

        {section === "need-help" && (
          <PanelPrompt
            text={getNeedHelpText()}
            background={"transparent-black"}
          />
        )}

        {section === "help-is-here" && (
          <>
            <PanelPrompt
              text={getPreFindText()}
              background={"transparent-black"}
              onClick={gotoFound}
            />
            <WaitThen wait={1} andThen={gotoFound} />
          </>
        )}

        {/* auto continue if at the museum */}
        {section === "reveal-full" &&
          props.recipientLocation === "at-museum" && (
            <WaitThen wait={1} andThen={gotoFoundAudio} />
          )}

        {section === "play-audio" && (
          <AudioPlayer
            message={getPlaySendersMessage()}
            src={giftPart.note}
            forwardButtonType={"go-to-end"}
            giftId={props.gift.id}
            audioReference={`r-part${
              props.giftPartIndex + 1
            }-play-sender-message`}
            onPlaybackComplete={handleAudioPlaybackFinished}
          />
        )}

        {section === "show-clue-found" && (
          <PanelPrompt text={giftPart.clue} background={"transparent-black"} />
        )}

        {section === "unwrapped" && (
          <>
            <PanelPrompt background={"transparent-black"}>
              <DoneIconWrap>
                <SvgIconDone />
              </DoneIconWrap>

              <PanelText>{content.unwrappedText}</PanelText>
            </PanelPrompt>

            <WaitThen wait={5} andThen={handleContinue} />
          </>
        )}

        {section === "outro" && (
          <AudioPlayer
            message={content.preOutroText}
            src={getOutroAudioFile()}
            forwardButtonType={"go-to-end"}
            giftId={props.gift.id}
            audioReference={`r-part${props.giftPartIndex + 1}-outro`}
            onPlaybackComplete={() => {
              setOutroAudioPlaybackFinished(true);
            }}
          />
        )}
      </PanelContent>

      <PanelButtons>{getButtons()}</PanelButtons>
    </Panel>
  );
};

export { ReceivingPartContent };
