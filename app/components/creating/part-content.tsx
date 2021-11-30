import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

import styled from "styled-components";

import { LocalFile, InProgressGift, InProgressGiftPart } from "../../domain";

import { assetStore, events } from "../../services";
import {
  cPartStartedEvent,
  cPartPhotoCompletedEvent,
  cPartClueSkippedEvent,
  cPartClueCancelledEvent,
  cPartClueCompletedEvent,
  cPartCompletedEvent,
} from "../../event-definitions";

import { Panel, PanelContent } from "../panel";
import { PanelPrompt } from "../panel-prompt";
import { PanelButtons } from "../panel-buttons";
import { Button } from "../buttons";
import { AudioPlayer } from "../media/audio-player";
import { AudioTranscription } from "../media/audio-transcription";
import { WaitThen } from "../utils/wait-then";
import { PhotoCapture } from "../media/photo-capture";
import { TextAreaModal } from "../../components/modals/text-area-modal";
import { CreateGiftRecordAndPlayback } from "./record-and-playback";
import { InformationWindow } from "../modals/information-window";
import { HelpContent } from "../information/help";

/***
 * Show the creating gift part content
 */

export type CreateGiftNextStep = "wrap-up" | "add-more";

interface PartContentStyleProps {
  backgroundImage?: string; // data or url
  showWhiteOverlay?: boolean;
}

const PartContentStyle = styled(Panel)<PartContentStyleProps>`
  background-image: url(${(props) => props.backgroundImage});
  background-position: center;
  background-size: cover;
  position: relative;

  ${(props: PartContentStyleProps) =>
    props.showWhiteOverlay &&
    `
    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background-color: rgba(255,255,255,0.3);
      pointer-events: none;
    }
  `}
`;

type Status =
  | "first-message"
  | "second-message"
  | "take-photo"
  | "pre-record-message"
  | "record-message"
  | "check-message"
  | "pre-clue-message1"
  | "pre-clue-message2"
  | "finish-message1"
  | "finish-message2"
  | "send-or-add-more";

export interface Props {
  recipientName: string;
  gift: InProgressGift;
  onComplete: (parts: InProgressGiftPart[]) => void;
  content: any;
}

export const CreatingPartContent: React.FC<Props> = ({
  recipientName,
  gift,
  onComplete,
  content,
}) => {
  // TODO: Abstract component to deal with one part at a a time
  // TODO: Abstract individual bits of part-creation out (maybe)

  // State
  const [giftPartIndex, setGiftPartIndex] = useState(0); // The current gift part index
  const [parts, setParts] = useState<InProgressGiftPart[]>([]); // TODO: clean the state up -- separate out
  const [currentPart, setCurrentPart] = useState<Partial<InProgressGiftPart>>(
    {}
  );

  const [status, setStatus] = useState<Status>("first-message");
  const [firstAudioHasPlayed, setFirstAudioHasPlayed] = useState(false);
  const [secondAudioHasPlayed, setSecondAudioHasPlayed] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [showingEnterClue, setShowingEnterClue] = useState(false);
  const [helpIsOpen, setHelpIsOpen] = useState(false);

  for (let key of Object.keys(content)) {
    if (typeof content[key] === "string") {
      content[key] = content[key].replace("${recipientName}", recipientName);
    }
  }

  // 1 | 2 | 3
  const partNumber = giftPartIndex + 1;

  useEffect(() => {
    events.track(cPartStartedEvent(gift.id, partNumber));
  }, [giftPartIndex]);

  // Sets all state to initial values
  function resetState() {
    setFirstAudioHasPlayed(false);
    setSecondAudioHasPlayed(false);
    setCurrentPart({});
  }

  function openHelp() {
    setHelpIsOpen(true);
  }

  function handlePhotoTaken(file: LocalFile) {
    setCurrentPart({ ...currentPart, photo: file });
    // Use this image as the background of the component
    setBackgroundImage(file.url);
    setStatus("pre-record-message");
  }

  function handleAudioRecordFinished(file: LocalFile) {
    setCurrentPart({ ...currentPart, note: file });

    handleAudioChecked();
  }

  function handleAudioReRecord() {
    setStatus("check-message");
  }

  function handleAudioChecked() {
    // Go to next part
    // Parts 2 and 3 don't have the first clue section
    giftPartIndex === 0
      ? setStatus("pre-clue-message1")
      : setStatus("pre-clue-message2");
  }

  function handleClueSet(clue: string) {
    // Store the clue
    setCurrentPart({ ...currentPart, clue });

    // Hide the dialog
    setShowingEnterClue(false);

    // Next
    setStatus("finish-message1");
  }

  function clearClueAndNext() {
    setCurrentPart({ ...currentPart, clue: "" });

    // Next
    setStatus("finish-message1");
  }

  // Part creation is complete
  function handleAllComplete() {
    // Note: part number is 1 based, rather than index 0 based.
    events.track(cPartCompletedEvent(gift.id, partNumber));

    parts[giftPartIndex] = currentPart as InProgressGiftPart; // eww
    onComplete(parts);
  }

  // Start on part 2
  function handleStartPart2() {
    events.track(cPartCompletedEvent(gift.id, partNumber));

    parts[giftPartIndex] = currentPart as InProgressGiftPart; // eww

    resetState();
    setGiftPartIndex(1);

    // Note no first message for part 2, jump to second section
    setStatus("second-message");
  }

  // Start on part 3
  function handleStartPart3() {
    events.track(cPartCompletedEvent(gift.id, partNumber));

    parts[giftPartIndex] = currentPart as InProgressGiftPart; // eww

    resetState();
    setGiftPartIndex(2);

    // Note no first message for part 3, jump to second section
    setStatus("second-message");
  }

  // Render different bits of content
  function renderFirstMessage() {
    // note: only for gift part 1
    return (
      <>
        <PanelContent>
          {giftPartIndex === 0 && (
            <PanelPrompt
              text={content.introText}
              background={"transparent-black"}
              onClick={() => {
                setStatus("second-message");
              }}
            />
          )}
          <WaitThen
            wait={4}
            andThen={() => {
              setStatus("second-message");
            }}
          />
        </PanelContent>
      </>
    );
  }

  function renderSecondMessage() {
    return (
      <>
        {/* Audio transcriptions live outside of the PanelContent for layout purposes */}
        {giftPartIndex === 0 && (
          <AudioTranscription giftId={gift.id} audioReference={"r-part1-look"}>
            <ReactMarkdown>
              {content.firstPartIntroAudioTranscript}
            </ReactMarkdown>
          </AudioTranscription>
        )}
        {giftPartIndex === 1 && (
          <AudioTranscription giftId={gift.id} audioReference={"r-part2-look"}>
            <ReactMarkdown>
              {content.secondPartIntroAudioTranscript}
            </ReactMarkdown>
          </AudioTranscription>
        )}
        {giftPartIndex === 2 && (
          <AudioTranscription giftId={gift.id} audioReference={"r-part3-look"}>
            <ReactMarkdown>
              {content.thirdPartIntroAudioTranscript}
            </ReactMarkdown>
          </AudioTranscription>
        )}

        <PanelContent>
          {giftPartIndex === 0 && (
            <AudioPlayer
              message={content.firstPartIntroText}
              src={content.firstPartIntroAudio}
              forwardButtonType={"go-to-end"}
              giftId={gift.id}
              audioReference={"r-part1-look"}
              onPlaybackComplete={() => {
                setFirstAudioHasPlayed(true);
              }}
            />
          )}
          {giftPartIndex === 1 && (
            <AudioPlayer
              message={content.secondPartIntroText}
              src={content.secondPartIntroAudio}
              forwardButtonType={"go-to-end"}
              giftId={gift.id}
              audioReference={"r-part2-look"}
              onPlaybackComplete={() => {
                setFirstAudioHasPlayed(true);
              }}
            />
          )}
          {giftPartIndex === 2 && (
            <AudioPlayer
              message={content.thirdPartIntroText}
              src={content.thirdPartIntroAudio}
              forwardButtonType={"go-to-end"}
              giftId={gift.id}
              audioReference={"r-part3-look"}
              onPlaybackComplete={() => {
                setFirstAudioHasPlayed(true);
              }}
            />
          )}
        </PanelContent>
        <PanelButtons>
          {firstAudioHasPlayed && (
            <Button
              onClick={() => {
                setStatus("take-photo");
              }}
              primary={true}
            >
              {content.introContinueButtonText}
            </Button>
          )}
        </PanelButtons>
      </>
    );
  }

  function renderTakePhoto() {
    let photoCapture: PhotoCapture | null;

    return (
      <>
        <PanelContent>
          {giftPartIndex === 0 && (
            <PhotoCapture
              text={content.firstPartTakePhotoText}
              onPhotoTaken={(file) => {
                events.track(cPartPhotoCompletedEvent(gift.id, partNumber));
                handlePhotoTaken(file);
              }}
              ref={(pc) => {
                photoCapture = pc;
              }}
            />
          )}
          {giftPartIndex === 1 && (
            <PhotoCapture
              text={content.secondPartTakePhotoText}
              onPhotoTaken={(file) => {
                events.track(cPartPhotoCompletedEvent(gift.id, partNumber));
                handlePhotoTaken(file);
              }}
              ref={(pc) => {
                photoCapture = pc;
              }}
            />
          )}
          {giftPartIndex === 2 && (
            <PhotoCapture
              text={content.thirdPartTakePhotoText}
              onPhotoTaken={(file) => {
                events.track(cPartPhotoCompletedEvent(gift.id, partNumber));
                handlePhotoTaken(file);
              }}
              ref={(pc) => {
                photoCapture = pc;
              }}
            />
          )}
        </PanelContent>
        <PanelButtons>
          {/* <Button onClick={() => {setStatus('second-message'); }}>Back</Button> */}
          <Button
            onClick={() => {
              if (photoCapture) photoCapture.showCamera();
            }}
            primary={true}
          >
            {content.openCameraButtonText}
          </Button>
        </PanelButtons>
      </>
    );
  }

  function renderPreRecordMessage() {
    return (
      <>
        {/* Audio transcriptions live outside of the PanelContent for layout purposes */}
        {giftPartIndex === 0 && (
          <AudioTranscription
            giftId={gift.id}
            audioReference={"r-part1-tell-them-why"}
          >
            <ReactMarkdown>
              {content.firstPartPreRecordAudioTranscript}
            </ReactMarkdown>
          </AudioTranscription>
        )}
        {giftPartIndex === 1 && (
          <AudioTranscription
            giftId={gift.id}
            audioReference={"r-part2-tell-them-why"}
          >
            <ReactMarkdown>
              {content.secondPartPreRecordAudioTranscript}
            </ReactMarkdown>
          </AudioTranscription>
        )}
        {giftPartIndex === 2 && (
          <AudioTranscription
            giftId={gift.id}
            audioReference={"r-part3-tell-them-why"}
          >
            <ReactMarkdown>
              {content.thirdPartPreRecordAudioTranscript}
            </ReactMarkdown>
          </AudioTranscription>
        )}

        <PanelContent>
          {giftPartIndex === 0 && (
            <AudioPlayer
              message={content.firstPartPreRecordText}
              src={content.firstPartPreRecordAudio}
              forwardButtonType={"go-to-end"}
              giftId={gift.id}
              audioReference={"r-part1-tell-them-why"}
              onPlaybackComplete={() => {
                setSecondAudioHasPlayed(true);
              }}
            />
          )}
          {giftPartIndex === 1 && (
            <AudioPlayer
              message={content.secondPartPreRecordText}
              src={content.secondPartPreRecordAudio}
              forwardButtonType={"go-to-end"}
              giftId={gift.id}
              audioReference={"r-part2-tell-them-why"}
              onPlaybackComplete={() => {
                setSecondAudioHasPlayed(true);
              }}
            />
          )}
          {giftPartIndex === 2 && (
            <AudioPlayer
              message={content.thirdPartPreRecordText}
              src={content.thirdPartPreRecordAudio}
              forwardButtonType={"go-to-end"}
              giftId={gift.id}
              audioReference={"r-part3-tell-them-why"}
              onPlaybackComplete={() => {
                setSecondAudioHasPlayed(true);
              }}
            />
          )}
        </PanelContent>
        <PanelButtons>
          {/* {secondAudioHasPlayed && <Button onClick={() => {setStatus('record-message'); }}>Skip</Button>} */}
          {secondAudioHasPlayed && (
            <Button
              onClick={() => {
                setStatus("record-message");
              }}
              primary={true}
            >
              {content.startRecordingButtonText}
            </Button>
          )}
        </PanelButtons>
      </>
    );
  }

  function renderRecordMessage() {
    const text =
      giftPartIndex === 0
        ? content.firstPartRecordText
        : giftPartIndex === 1
        ? content.secondPartRecordText
        : giftPartIndex === 2
        ? content.thirdPartRecordText
        : "";

    return (
      <CreateGiftRecordAndPlayback
        playbackMessage={content.recordPlaybackText}
        gift={gift}
        giftPartIndex={giftPartIndex}
        text={text}
        saveButtonText={content.recordSaveButtonText}
        onComplete={handleAudioRecordFinished}
        onReRecord={handleAudioReRecord}
      />
    );
  }

  function renderCheckMessage() {
    return (
      <>
        <PanelContent>
          <PanelPrompt
            background={"transparent-black"}
            text={content.checkHeadphonesText}
          />
        </PanelContent>
        <PanelButtons>
          <Button onClick={openHelp}>{content.helpText}</Button>
          <Button
            onClick={() => {
              setStatus("record-message");
            }}
            primary={true}
          >
            {content.checkHeadphonesConfirmText}
          </Button>
        </PanelButtons>
      </>
    );
  }

  function renderPreClueMessage1() {
    // This part is only show for gift part 1. 2 and 3 skip it.
    const next = () => {
      setStatus("pre-clue-message2");
    };

    return (
      <>
        <PanelContent>
          <PanelPrompt
            background={"transparent-black"}
            text={content.clueIntroText}
            onClick={next}
          />
          <WaitThen wait={4} andThen={next} />
        </PanelContent>
      </>
    );
  }

  function renderPreClueMessage2() {
    const text =
      giftPartIndex === 0
        ? content.firstPartPreClueText
        : giftPartIndex === 1
        ? content.secondPartPreClueText
        : giftPartIndex === 2
        ? content.thirdPartPreClueText
        : "";

    const next = () => {
      setShowingEnterClue(true);
    };

    return (
      <>
        <PanelContent>
          <PanelPrompt
            text={text}
            background={"transparent-black"}
            onClick={next}
          />
        </PanelContent>
        <PanelButtons>
          <Button
            onClick={() => {
              events.track(cPartClueSkippedEvent(gift.id, partNumber));
              clearClueAndNext();
            }}
          >
            {content.skipText}
          </Button>
          <Button onClick={next}>{content.writeHintButtonText}</Button>
        </PanelButtons>
      </>
    );
  }

  function renderFinishMessage1() {
    // goto different next section based on gift part index
    // Return the function to call next
    const next = () => {
      switch (giftPartIndex) {
        case 0:
          return setStatus("finish-message2");
        case 1:
          return setStatus("send-or-add-more");
        case 2:
          return handleAllComplete();
        default:
          return {};
      }
    };

    const text =
      giftPartIndex === 0
        ? content.firstPartFinishTextOne
        : giftPartIndex === 1
        ? content.secondPartFinishText
        : giftPartIndex === 2
        ? content.thirdPartFinishText
        : "";

    const wait = giftPartIndex === 0 ? 3 : 1;

    return (
      <>
        <PanelContent>
          <PanelPrompt
            text={text}
            background={"transparent-black"}
            onClick={next}
          />
          <WaitThen wait={wait} andThen={next} />
        </PanelContent>
      </>
    );
  }

  function renderFinishMessage2() {
    return (
      <>
        <PanelContent>
          {giftPartIndex === 0 && (
            <PanelPrompt
              text={content.firstPartFinishTextTwo}
              background={"transparent-black"}
              onClick={() => {
                setStatus("send-or-add-more");
              }}
            />
          )}
          <WaitThen
            wait={2}
            andThen={() => {
              setStatus("send-or-add-more");
            }}
          />
        </PanelContent>
      </>
    );
  }

  function renderSendOrAddMore() {
    return (
      <>
        <PanelContent>
          {giftPartIndex === 0 && (
            <PanelPrompt
              text={content.firstPartSendOrAddMoreText}
              background={"transparent-black"}
            />
          )}
          {giftPartIndex === 1 && (
            <PanelPrompt
              text={content.secondPartSendOrAddMoreText}
              background={"transparent-black"}
            />
          )}
        </PanelContent>
        <PanelButtons>
          <Button onClick={handleAllComplete}>
            {content.sendNowButtonText}
          </Button>
          {giftPartIndex === 0 && (
            <Button onClick={handleStartPart2} primary={true}>
              {content.addObjectButtonText}
            </Button>
          )}
          {giftPartIndex === 1 && (
            <Button onClick={handleStartPart3} primary={true}>
              {content.addObjectButtonText}
            </Button>
          )}
        </PanelButtons>
      </>
    );
  }

  return (
    <>
      {showingEnterClue && (
        <TextAreaModal
          placeHolder={content.hintInputPlaceholder}
          onSaveClick={(clue: string) => {
            events.track(cPartClueCompletedEvent(gift.id, partNumber));
            handleClueSet(clue);
          }}
          onCancelClick={() => {
            events.track(cPartClueCancelledEvent(gift.id, partNumber));
            setShowingEnterClue(false);
          }}
        />
      )}

      {helpIsOpen && (
        <InformationWindow
          onClose={() => {
            setHelpIsOpen(false);
          }}
        >
          <HelpContent />
        </InformationWindow>
      )}

      <PartContentStyle
        backgroundImage={backgroundImage}
        showWhiteOverlay={false}
      >
        {status === "first-message" && renderFirstMessage()}
        {status === "second-message" && renderSecondMessage()}
        {status === "take-photo" && renderTakePhoto()}
        {status === "pre-record-message" && renderPreRecordMessage()}
        {status === "record-message" && renderRecordMessage()}
        {status === "check-message" && renderCheckMessage()}
        {status === "pre-clue-message1" && renderPreClueMessage1()}
        {status === "pre-clue-message2" && renderPreClueMessage2()}
        {status === "finish-message1" && renderFinishMessage1()}
        {status === "finish-message2" && renderFinishMessage2()}
        {status === "send-or-add-more" && renderSendOrAddMore()}
      </PartContentStyle>
    </>
  );
};
