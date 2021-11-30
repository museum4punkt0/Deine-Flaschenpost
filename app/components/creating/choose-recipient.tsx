import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

import { Panel, PanelContent } from "../panel";
import { PanelButtons } from "../panel-buttons";
import { Button } from "../buttons";
import { AudioPlayer } from "../media/audio-player";
import { AudioTranscription } from "../media/audio-transcription";
import { TextInputModal } from "../modals/text-input-modal";

/**
 * The start of making a gift. User enters recipient name.
 */

interface Props {
  giftId: string;
  onComplete: (recipientName: string) => void; // Callback to call when name is entered
  content: any;
}

export const CreateGiftChooseRecipient: React.FC<Props> = ({
  giftId,
  onComplete,
  content,
}) => {
  // State
  const [showingEnterRecipient, setShowingEnterRecipient] = useState(false);
  const [audioHasPlayed, setAudioHasPlayed] = useState(false);

  return (
    <>
      {showingEnterRecipient && (
        <TextInputModal
          placeHolder={content.textInputPlaceholder}
          onSaveClick={(recipientName) => {
            onComplete(recipientName);
          }}
          onCancelClick={() => {
            setShowingEnterRecipient(false);
          }}
        />
      )}

      <Panel>
        <AudioTranscription
          giftId={giftId}
          audioReference={"c-choose-recipient"}
        >
          <ReactMarkdown>{content.audioTranscript}</ReactMarkdown>
        </AudioTranscription>

        <PanelContent>
          <AudioPlayer
            message={content.audioMessage}
            src={content.audio}
            forwardButtonType={"go-to-end"}
            giftId={giftId}
            audioReference={"c-choose-recipient"}
            onPlaybackComplete={() => setAudioHasPlayed(true)}
          />
        </PanelContent>

        <PanelButtons>
          {audioHasPlayed && (
            <Button
              onClick={() => {
                setShowingEnterRecipient(true);
              }}
              primary={true}
            >
              {content.enterNameMessage}
            </Button>
          )}
        </PanelButtons>
      </Panel>
    </>
  );
};
