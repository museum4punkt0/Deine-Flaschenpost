import { v5 as uuidv5 } from "uuid";

export const museum = {
  id: uuidv5("https://example.com", uuidv5.URL),
  slug: "blm",
  name: "",
  curatedGiftId: uuidv5("", uuidv5.URL),
  promoLink: "/promo",
  promoDestination: "",
  feedbackUrl: "",
  homeScreenStartPoint: "ever-made-a-mixtape",
  homeScreenShowCuratedGift: true,
  assets: {},
};
