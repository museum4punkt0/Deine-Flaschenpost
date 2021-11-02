import React, { useState } from "react";

import { Panel, PanelContent } from "../panel";
import { PanelTitle } from "../panel-title";
import { PanelSubTitle } from "../panel-sub-title";
import { PanelPrompt } from "../panel-prompt";
import { PanelButtons } from "../panel-buttons";
import { Button } from "../buttons";
import { TextInputModal } from "../modals/text-input-modal";

/**
 * Sign the gift.  Sender enters their name.
 */

interface Props {
  onComplete: (senderName: string) => void;
  recipientName: string;
  content: any;
}

export const SignGift: React.FC<Props> = ({
  onComplete,
  recipientName,
  content,
}) => {
  // State
  const [showingEnterName, setShowingEnterName] = useState(false);

  for (let key of Object.keys(content)) {
    if (typeof content[key] === "string") {
      content[key] = content[key].replace("${recipientName}", recipientName);
    }
  }

  return (
    <>
      {showingEnterName && (
        <TextInputModal
          placeHolder={content.writeNameInputPlaceholder}
          onSaveClick={(name) => {
            onComplete(name);
          }}
          onCancelClick={() => {
            setShowingEnterName(false);
          }}
        />
      )}

      <Panel>
        <PanelTitle textSize={70}>{content.title}</PanelTitle>
        <PanelSubTitle>{content.subtitle}</PanelSubTitle>
        <PanelContent>
          <PanelPrompt
            text={content.promptText}
            background={"transparent-black"}
            onClick={() => {
              setShowingEnterName(true);
            }}
          />
        </PanelContent>
        <PanelButtons>
          <Button
            onClick={() => {
              setShowingEnterName(true);
            }}
            primary={true}
          >
            {content.writeNameButtonText}
          </Button>
        </PanelButtons>
      </Panel>
    </>
  );
};
