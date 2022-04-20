import React, { useState } from "react";
import { useRouter } from "next/router";

import { Panel, PanelContent } from "../panel";
import { PanelPrompt } from "../panel-prompt";
import { PanelButtons } from "../panel-buttons";
import { Button } from "../buttons";
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
  const router = useRouter();

  function handleContinue() {
    events.track(cOutroCompletedEvent(gift.id));

    // Go to the home screen
    router.push("/");
  }

  return (
    <Panel>
      <PanelContent>
        <PanelPrompt
          text={content.thanksMessage}
          textSize={50}
          background="transparent-black"
          onClick={handleContinue}
        />
      </PanelContent>

      <PanelButtons>
        <Button primary={true} onClick={handleContinue}>
          {content.doneButtonText}
        </Button>
      </PanelButtons>
    </Panel>
  );
};

export { CreatingOutro };
