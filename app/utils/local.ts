/**
 * This module contains domain specifc functions for interacting with the local
 * storage.  (Persistent across reloads.)
 */

import { v5 as uuidv5 } from "uuid";

import {
  getLocalItem,
  setLocalItem,
  getSessionItem,
  setSessionItem,
} from "./storage";
import { RecipientLocation } from "../components/choose-location";
import { Gift } from "../domain";

// HasSeenHomeIntro
export function getHasSeenHomeIntro(): boolean {
  if (typeof window === "undefined") return false;
  return !!getLocalItem<boolean>("hasSeenHomeIntro");
}
export function setHasSeenHomeIntro(hasSeen: boolean): void {
  setLocalItem("hasSeenHomeIntro", hasSeen);
}

// HasUnopenedMuseumGift
export function getHasUnopenedMuseumGift(): boolean {
  if (typeof window === "undefined") return false;
  // Default to true
  return getLocalItem<boolean>("hasUnopenedMuseumGift") === undefined
    ? true
    : !!getLocalItem<boolean>("hasUnopenedMuseumGift");
}
export function setHasUnopenedMuseumGift(opened: boolean): void {
  setLocalItem("hasUnopenedMuseumGift", opened);
}

// SessionRecipientLocation
export function getSessionRecipientLocation(): RecipientLocation {
  if (typeof window === "undefined") return "unknown";
  // Default to unknown
  return getSessionItem<RecipientLocation>("recipientLocation") || "unknown";
}
export function setSessionRecipientLocation(
  recipientLocation: RecipientLocation
): void {
  setSessionItem("recipientLocation", recipientLocation);
}

// User has agreed terms
export function getUserHasAgreedTerms(): boolean {
  if (typeof window === "undefined") return true;
  return !!getLocalItem<boolean>("userHasAgreedTerms");
}
export function setUserHasAgreedTerms(): void {
  setLocalItem("userHasAgreedTerms", true);
}
