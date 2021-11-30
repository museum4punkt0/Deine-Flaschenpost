import React, { useEffect } from "react";
import { useRouter } from "next/router";

import { api } from "../../services";

import {
  fetchGlobalLayout,
  fetchMenuItems,
  fetchScreenContent,
} from "../../services/content-provider";

import { museum } from "../../data";
import { ReceiveGift } from "../../components/receiving/receive-gift";
import { WorkingProgress } from "../../components/messages/working-progress";
import { ErrorMessage } from "../../components/messages/error-message";

export async function getStaticPaths() {
  return { paths: [], fallback: true };
}

export async function getStaticProps({ params }) {
  const globalLayout = await fetchGlobalLayout();
  const menuItems = await fetchMenuItems();

  const { giftId } = params;
  try {
    let giftResponse = await api.getGift(giftId);
    let gift = null;
    if (giftResponse.kind == "ok") {
      gift = giftResponse.data;
    }

    const screenReceiveGiftGlobal = await fetchScreenContent(
      "screen-receive-gift-global"
    );

    const screenOpenGift = await fetchScreenContent(
      "screen-receive-gift-open-gift"
    );

    const screenOpenOrSave = await fetchScreenContent(
      "screen-receive-gift-open-or-save"
    );

    const screenChooseLocation = await fetchScreenContent(
      "screen-choose-location"
    );

    const screenParts = await fetchScreenContent("screen-receive-gift-parts");

    return {
      props: {
        gift: gift,
        globalLayout: globalLayout,
        menuItems: menuItems,
        content: {
          global: screenReceiveGiftGlobal,
          openGift: screenOpenGift,
          openOrSave: screenOpenOrSave,
          chooseLocation: screenChooseLocation,
          parts: screenParts,
        },
      },
      revalidate: 300,
    };
  } catch (error) {
    return {
      notFound: true,
      props: {
        globalLayout: globalLayout,
        menuItems: menuItems,
      },
      revalidate: 300,
    };
  }
}

interface Props {
  content: any;
}

/**
 *
 */
const ReceiveGiftScreen: React.FC<Props> = ({ gift, content }) => {
  const router = useRouter();
  let giftId = undefined;

  if (router.isFallback) {
    return <WorkingProgress text="Lade dein Geschenk..." percent={0} />;
  }

  if (!gift) {
    return (
      <ErrorMessage message="Wir konnten dein Geschenk leider nicht auf unserem Server finden." />
    );
  }

  return <ReceiveGift gift={gift} content={content} />;
};

export default ReceiveGiftScreen;
