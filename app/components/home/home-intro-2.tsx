import React from "react";

import { Panel, PanelContent } from "../panel";
import { PanelPrompt } from "../panel-prompt";
import { WaitThen } from "../utils/wait-then";

/**
 * Second home intro screen
 */

interface Props {
  onComplete: () => void; // Callback to fire when this content is complete
}

const HomeIntro2: React.FC<Props> = ({ onComplete, texts }) => {
  // Locals
  const defaultWait = 5;

  function handleComplete() {
    if (onComplete) {
      onComplete();
    }
  }

  return (
    <Panel>
      <PanelContent topPosition="top-quarter">
        <PanelPrompt
          text={texts.introText}
          textColor="black"
          textSize={70}
          background="solid-white"
          onClick={handleComplete}
        />
      </PanelContent>

      <WaitThen wait={defaultWait} andThen={handleComplete} />
    </Panel>
  );
};

export { HomeIntro2 };
