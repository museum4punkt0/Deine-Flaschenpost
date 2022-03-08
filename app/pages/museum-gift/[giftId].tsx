import React from "react";
import { useRouter } from "next/router";

import {
  fetchGlobalLayout,
  fetchMenuItems,
  fetchScreenContent,
} from "../../services/content-provider";

import { useAsync } from "../../utils/use-async";
import { usePreload, totalProgress } from "../../utils/use-preload";

import { api } from "../../services";
import { GetGiftResponse } from "../../services/api";

import { museum } from "../../data";
import { ReceiveGift } from "../../components/receiving/receive-gift";
import { WorkingProgress } from "../../components/messages/working-progress";
import { ErrorMessage } from "../../components/messages/error-message";

import { config } from "../../config";

const API_URL = config.cmsUri;

async function fetchMuseumGift(id) {
  const res = await fetch(`${API_URL}/museum-gifts/${id}`);

  if (res.ok) return res.json();
  if (res.status == 404) return {};
  throw new Error(`Could not fetch museum gift with id ${id}`);
}

function processFetchedGift(gift) {
  gift.parts = gift.parts.map((part) => ({
    photo: API_URL + part.photo.url,
    note: API_URL + part.audio.url,
    clue: part.clue,
  }));
  gift.kind = "MuseumGift";
  return gift;
}

export async function getStaticPaths() {
  return { paths: [], fallback: true };
}

export async function getStaticProps({ params }) {
  const globalLayout = await fetchGlobalLayout();
  const menuItems = await fetchMenuItems();

  const { giftId } = params;

  const statusContent = await fetchScreenContent("screen-receive-gift-status");

  try {
    let gift = await fetchMuseumGift(giftId);
    if (Object.keys(gift).length) gift = processFetchedGift(gift);

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
          status: statusContent,
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
        content: {
          status: statusContent,
        },
      },
      revalidate: 300,
    };
  }
}

interface Props {
  gift: any;
  content: any;
}
/**
 *
 */
const ReceiveGiftScreen: React.FC<Props> = ({ gift, content }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <WorkingProgress text="Lade..." percent={0} />;
  }

  if (!Object.keys(gift).length) {
    return <ErrorMessage message={content.status.notFoundMessage} />;
  }

  return <ReceiveGift gift={gift} content={content} />;
};

export default ReceiveGiftScreen;
