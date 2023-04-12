import { config } from "../config";
import { globalLayoutFallback } from "./content-offline-fallback";

const API_URL = config.cmsUri;

function transformMediaUrl(url) {
  return API_URL + url;
}

function transformGlobalLayout(data) {
  const textKeys = [
    "museumName",
    "appTitle",
    "appCaption",
    "inputCancelMessage",
    "inputSaveMessage",
    "clickToOpenText",
    "curatedGiftUrl",
    "termsModalTitle",
    "termsModalText",
    "termsModalReadButtonText",
    "termsModalAgreeButtonText",
    "termsUrl",
  ];
  const mediaKeys = [
    "favicon16x16",
    "favicon32x32",
    "favicon48x48",
    "appleTouchIcon",
    "openGraphImage",
    "museumLogoSvg",
    "backgroundImage",
    "giftImage",
    "promptCircle",
    "playButtonIcon",
    "repeatButtonIcon",
    "skipButtonIcon",
    "transcriptionIcon",
    "cameraIcon",
    "smsIcon",
    "mailIcon",
    "whatsappIcon",
    "messengerIcon",
  ];
  const colorKeys = ["titleColor", "promptColor"];

  let globalLayout = {};
  textKeys.forEach((key) => {
    globalLayout[key] = data[key];
  });
  colorKeys.forEach((key) => {
    globalLayout[key] = `rgb(${data[key].r}, ${data[key].g}, ${data[key].b})`;
  });
  mediaKeys.forEach((key) => {
    globalLayout[key] = transformMediaUrl(data[key].url);
  });

  return globalLayout;
}

async function fetchFromCMS(cmsPath, transformItemFunc, fallbackItem) {
  const url = API_URL + "/" + cmsPath;

  try {
    const res = await fetch(url);

    if (res.ok) {
      let item = await res.json();
      item = transformItemFunc(item);
      return item;
    } else {
      console.error(
        `Error fetching ${cmsPath}. Response status: ${res.status}`
      );
    }
  } catch (error) {
    console.error(`Error fetching ${cmsPath}: ${error}`);
  }
  return fallbackItem;
}

export async function fetchGlobalLayout() {
  return fetchFromCMS(
    "global-layout",
    transformGlobalLayout,
    globalLayoutFallback
  );
}

function transformMenuItems(data) {
  let menuItems = data.menuItemZone;
  let helpTextTitle = data.helpTextTitle;
  return menuItems.map((menuItem) => ({
    itemType:
      menuItem.__component == "menu.richtext-menu-item" ? "richtext" : "link",
    isHelp: menuItem.name === helpTextTitle,
    ...menuItem,
  }));
}

function transformColors(data) {
  for (const key of Object.keys(data)) {
    if (
      typeof data[key] == "object" &&
      "r" in data[key] &&
      "g" in data[key] &&
      "b" in data[key]
    ) {
      data[
        key
      ] = `rgb(${data[key]["r"]}, ${data[key]["g"]}, ${data[key]["b"]})`;
    }
  }
  return data;
}

export async function fetchMenuItems() {
  return fetchFromCMS("menu-items", transformMenuItems, {});
}

export async function fetchScreenTexts(screenName: string) {
  return fetchFromCMS(screenName, transformColors, {});
}

function transformScreenContent(data) {
  for (const key of Object.keys(data)) {
    if (
      data[key] !== null &&
      typeof data[key] == "object" &&
      "r" in data[key] &&
      "g" in data[key] &&
      "b" in data[key]
    ) {
      data[
        key
      ] = `rgb(${data[key]["r"]}, ${data[key]["g"]}, ${data[key]["b"]})`;
    }
  }
  for (const key of Object.keys(data)) {
    if (
      data[key] !== null &&
      typeof data[key] == "object" &&
      "url" in data[key]
    )
      data[key] = transformMediaUrl(data[key]["url"]);
  }
  return data;
}

export async function fetchScreenContent(screenName: string) {
  return fetchFromCMS(screenName, transformScreenContent, {});
}
