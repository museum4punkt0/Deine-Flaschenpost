import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/router";

import { assetStore } from "../../services";

import { Panel, PanelContent } from "../panel";
import { PanelButtons } from "../panel-buttons";
import { Button } from "../buttons";
import { AudioPlayer } from "../media/audio-player";
import { AudioTranscription } from "../media/audio-transcription";
import { CShareTranscript } from "../audio-transcription/c-share";
import { InProgressGift } from "../../domain";

import { events } from "../../services";
import { cOutroCompletedEvent } from "../../event-definitions";

/**
 * Show the creating outro
 */

export interface Props {
  gift: InProgressGift;
  content: any;
}

const CreatingOutro: React.FC<Props> = ({ gift, content }) => {
  // State
  const [audioPlaybackFinished, setAudioPlaybackFinished] = useState(false);

  const router = useRouter();

  function handleContinue() {
    events.track(cOutroCompletedEvent(gift.id));

    // Go to the home screen
    router.push("/");
  }

  return (
    <Panel>
      <AudioTranscription giftId={gift.id} audioReference={"c-outro"}>
        <ReactMarkdown>{content.audioTranscript}</ReactMarkdown>
      </AudioTranscription>

      <PanelContent>
        <AudioPlayer
          message={content.audioMessage}
          src={content.audio}
          forwardButtonType={"go-to-end"}
          giftId={gift.id}
          audioReference={"c-outro"}
          onPlaybackComplete={() => {
            setAudioPlaybackFinished(true);
          }}
        />
      </PanelContent>

      <PanelButtons>
        {audioPlaybackFinished && (
          <Button primary={true} onClick={handleContinue}>
            {content.doneButtonText}
          </Button>
        )}
      </PanelButtons>
    </Panel>
  );
};

export { CreatingOutro };
