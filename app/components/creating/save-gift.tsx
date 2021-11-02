import React, { useEffect } from "react";
import { useRouter } from "next/router";

import { assertNever } from "../../utils/helpers";
import { InProgressGift, Gift } from "../../domain";
import { api, useGiftSaver, events } from "../../services";

import {
  cSavingAttemptedEvent,
  cSavingSucceededEvent,
  cSavingFailedEvent,
  cSavingRetriedEvent,
} from "../../event-definitions";

import { Panel, PanelContent } from "../panel";
import { PanelTitle } from "../panel-title";
import { PanelSubTitle } from "../panel-sub-title";
import { PanelPrompt } from "../panel-prompt";
import { PanelRound } from "../panel-round";
import { PanelButtons } from "../panel-buttons";
import { Button } from "../buttons";
import { ProgressLoader } from "../progress-loader";

interface Props {
  gift: InProgressGift;
  onComplete: (gift: Gift) => void;
  content: any;
}

export const SaveGift: React.FC<Props> = ({ gift, onComplete, content }) => {
  const saver = useGiftSaver(gift);

  useEffect(() => {
    events.track(cSavingAttemptedEvent(gift.id));
  }, []);

  // Actions on saver state-transitions
  useEffect(() => {
    if (saver.kind === "done") {
      events.track(cSavingSucceededEvent(gift.id));
      onComplete(saver.gift);
    }
    if (saver.kind === "invalid-gift") {
      events.track(cSavingFailedEvent(gift.id, saver.kind));
    }
    if (saver.kind === "uploading-assets-error") {
      events.track(cSavingFailedEvent(gift.id, saver.kind));
    }
    if (saver.kind === "saving-gift-error") {
      events.track(cSavingFailedEvent(gift.id, saver.error.kind));
    }
  }, [saver.kind]);

  // Cleanup on exit
  useEffect(() => () => saver.abort(), []);

  if (saver.kind === "uploading-assets") {
    return (
      <SavingInProgress
        text={content.uploadingText}
        progress={Math.round(saver.progress * 100)}
        content={content}
      />
    );
  }

  if (saver.kind === "saving-gift" || saver.kind === "done") {
    return <SavingInProgress text={content.processingText} content={content} />;
  }

  if (saver.kind === "invalid-gift") {
    return (
      <SavingFailedUnrecoverable
        text={content.uploadFailedUnrecoverableText}
        content={content}
      />
    );
  }

  if (saver.kind === "uploading-assets-error") {
    return (
      <SavingFailed
        text={content.uploadFailedCheckConnectionText}
        buttonText={content.tryAgainButtonText}
        onClick={() => {
          events.track(cSavingRetriedEvent(gift.id));
          saver.retry();
        }}
        content={content}
      />
    );
  }

  if (saver.kind === "saving-gift-error") {
    if (saver.error.kind === "http-error") {
      return (
        <SavingFailed
          text={content.uploadFailedText}
          buttonText={content.tryAgainButtonText}
          onClick={() => {
            events.track(cSavingRetriedEvent(gift.id));
            saver.retry();
          }}
          content={content}
        />
      );
    }

    return (
      <SavingFailed
        text={content.checkConnectionText}
        buttonText={content.tryAgainButtonText}
        onClick={() => {
          events.track(cSavingRetriedEvent(gift.id));
          saver.retry();
        }}
        content={content}
      />
    );
  }

  return assertNever(saver);
};

interface SavingInProgressProps {
  text: string;
  progress?: number;
  content: any;
}
export const SavingInProgress: React.FC<SavingInProgressProps> = ({
  text,
  progress,
  content,
}) => (
  <Panel>
    <PanelTitle>{content.title}</PanelTitle>
    <PanelSubTitle>{content.savingInProgressSubTitle}</PanelSubTitle>
    <PanelContent>
      <PanelRound background="transparent-black">
        <ProgressLoader text={text} percent={progress} colourTheme="white" />
      </PanelRound>
    </PanelContent>
  </Panel>
);

interface SavingFailedProps {
  text: string;
  buttonText: string;
  onClick: () => void;
  content: any;
}
const SavingFailed: React.FC<SavingFailedProps> = ({
  text,
  buttonText,
  onClick,
  content,
}) => (
  <Panel>
    <PanelTitle>{content.title}</PanelTitle>
    <PanelSubTitle>{content.savingFailedSubTitle}</PanelSubTitle>
    <PanelContent>
      <PanelPrompt background="transparent-black" text={text} />
    </PanelContent>
    <PanelButtons>
      <Button onClick={onClick} primary={true}>
        {buttonText}
      </Button>
    </PanelButtons>
  </Panel>
);

interface SavingFailedUnrecoverableProps {
  text: string;
  content: any;
}
const SavingFailedUnrecoverable: React.FC<SavingFailedUnrecoverableProps> = ({
  text,
  content,
}) => {
  const router = useRouter();
  return (
    <Panel>
      <PanelTitle>{content.title}</PanelTitle>
      <PanelSubTitle>{content.savingFailedUnrecoverableSubTitle}</PanelSubTitle>
      <PanelContent>
        <PanelPrompt background="transparent-black" text={text} />
      </PanelContent>
      <PanelButtons>
        <Button onClick={() => router.push("/")} primary={true}>
          {content.startButtonText}
        </Button>
      </PanelButtons>
    </Panel>
  );
};
