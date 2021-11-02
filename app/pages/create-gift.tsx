import React from "react";

import {
  fetchGlobalLayout,
  fetchMenuItems,
  fetchScreenTexts,
  fetchScreenContent,
} from "../services/content-provider";
import { config } from "../config";

import { isIosDeviceUsingChrome } from "../utils/helpers";
import { canUseAudioRecorder } from "../utils/use-audio-recorder";

import { museum } from "../data";
import { UnsupportedDevice } from "../components/messages/unsupported-device";
import { CreateGift } from "../components/creating/create-gift";

/**
 * Create gift screen
 */

const CreateGiftScreen: React.FC = ({ content }) => {
  // Check the device meets our requirements

  if (typeof window !== "undefined") {
    // If this is an iOS device using Chrome prompt the user to use Safari, as they will have it
    if (isIosDeviceUsingChrome()) {
      return <UnsupportedDevice message={texts.global.iOSUsingChromeMessage} />;
    }

    // If we can't record audio inform and force end
    if (!canUseAudioRecorder()) {
      return (
        <UnsupportedDevice message={texts.global.noAudioRecorderMessage} />
      );
    }
  }

  // Show
  return <CreateGift museumId={museum.id} content={content} />;
};

export default CreateGiftScreen;

export async function getStaticProps(context) {
  const globalLayout = await fetchGlobalLayout();
  const menuItems = await fetchMenuItems();
  const globalTexts = await fetchScreenTexts("screen-create-gift-global");
  const introTexts = await fetchScreenTexts("screen-create-gift-intro");
  const chooseRecipientContent = await fetchScreenContent(
    "screen-create-gift-choose-recipient"
  );
  const partsContent = await fetchScreenContent("screen-create-gift-parts");
  const signContent = await fetchScreenContent("screen-create-gift-sign");
  const saveContent = await fetchScreenContent("screen-create-gift-save");
  const shareContent = await fetchScreenContent("screen-create-gift-share");
  const outroContent = await fetchScreenContent("screen-create-gift-outro");
  const content = {
    global: globalTexts,
    intro: introTexts,
    chooseRecipient: chooseRecipientContent,
    parts: partsContent,
    sign: signContent,
    save: saveContent,
    share: shareContent,
    outro: outroContent,
  };
  return {
    props: {
      globalLayout: globalLayout,
      menuItems: menuItems,
      content: content,
    },
    revalidate: config.revalidateTime,
  };
}
