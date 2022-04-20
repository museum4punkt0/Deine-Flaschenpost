import React, { useState, useEffect } from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

import menu from "../globals/menu";
import globalLayout from "../globals/layout";
import { getUserHasAgreedTerms, setUserHasAgreedTerms } from "../utils/local";

import { ScreenTitle } from "./screen-title";
import { ScreenSubTitle } from "./screen-sub-title";
import { ScreenPostTitle } from "./screen-post-title";
import { ScreenLogo } from "./screen-logo";
import { InformationWindow } from "./modals/information-window";
import { Gradient } from "./gradient";
import { Menu, MenuBurger } from "./home/menu";
import { HeaderCloseButton } from "./home/header-close-button";
import { TermsModal } from "./modals/terms-modal";

/**
 * Global screen header
 */

// Texts wrapper
const HeaderTexts = styled.div`
  width: 70%;
  position: relative;
  left: 15%;
`;

type Padding = "none" | "small" | "medium" | "large";

type BottomPadding = "none" | "medium";

type ShowGradient = "none" | "small" | "big";

interface ScreenHeaderStyleProps {
  padding?: Padding;
  bottomPadding?: BottomPadding; // Optional value to override general padding
  background?: "none" | "white";
}

// Header
const ScreenHeaderStyle = styled.div<ScreenHeaderStyleProps>`
  width: 100%;
  height: 10rem;
  position: relative;
  display: flex;
  flex-flow: row-reverse;
  align-items: center;
  justify-content: space-between;
  padding: 3% 5% 3% 5%;

  ${(props) =>
    props.background === "white" &&
    `
    background-color: white;
  `}
  padding-bottom: ${(props) =>
    props.bottomPadding === "none" ? "0 !important" : null};
`;

const LogoStyle = styled.div`
  width: 30%;
  height: 100%;
  position: relative;
`;

const Logo = ({ src, ...rest }) => (
  <LogoStyle>
    <Image
      src={src}
      alt="Logo"
      layout="fill"
      objectFit="contain"
      objectPosition="left"
    />
  </LogoStyle>
);

interface Props {
  showLogo?: boolean;
  showMenuBurger?: boolean;
  showCloseButton?: boolean;
  showGradient?: ShowGradient;
  preSubTitle?: string; // Text above the sub title
  subTitle?: string; // Smaller Sub title
  postSubTitle?: string; // Text after the sub title
  title?: string; // The main Title text
  postTitle?: string; // Text after the main title
  titleSize?: number; // Title text size
  titleWeight?: "bold" | "black"; // Title weight
  padding?: Padding; // Padding to apply
  bottomPadding?: BottomPadding; // Bottom only padding
  background?: "none" | "white"; // Background colour
  onTermsAccepted?: () => void; // Callback for when the terms are accepted
}

const ScreenHeader: React.FC<Props> = (props: Props) => {
  // State
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isMenuItemOpen, setIsMenuItemOpen] = useState(
    menu.items.map((x) => false)
  );

  /*
  const [privacyIsOpen, setPrivacyIsOpen] = useState(false);
  const [imprintIsOpen, setImprintIsOpen] = useState(false);
  const [helpIsOpen, setHelpIsOpen] = useState(false);
  */

  const [termsModalIsOpen, setTermsModalIsOpen] = useState(false);

  // Locals
  const screenTitleMarginBottom =
    props.padding === "large" ? "medium" : "small";

  useEffect(() => {
    setTermsModalIsOpen(!getUserHasAgreedTerms());
  });

  // Functions
  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen);
  }

  function handleAgreeTerms() {
    // Record the state
    setUserHasAgreedTerms();

    // Close the dialog
    setTermsModalIsOpen(false);

    // Callback
    if (props.onTermsAccepted) {
      props.onTermsAccepted();
    }
  }

  function setMenuItemOpen(index, open) {
    setIsMenuItemOpen(
      isMenuItemOpen.map((prevIsOpen, curIndex) =>
        curIndex == index ? open : prevIsOpen
      )
    );
  }

  const menuItemsWithClick = menu.items.map((menuItem, index) => {
    if (menuItem.itemType === "richtext") {
      return {
        ...menuItem,
        onClick: () => {
          setMenuItemOpen(index, true);
        },
      };
    }
    return menuItem;
  });

  return (
    <>
      <ScreenHeaderStyle
        padding={props.padding}
        bottomPadding={props.bottomPadding}
        background={props.background}
      >
        {isMenuOpen && (
          <Menu
            menuItems={menuItemsWithClick}
            onCloseClick={() => {
              setIsMenuOpen(false);
            }}
          />
        )}

        {props.showMenuBurger && !isMenuOpen && (
          <MenuBurger onClick={toggleMenu} />
        )}

        {!isMenuOpen && props.showLogo && (
          <Logo src={globalLayout.museumLogoSvg} />
        )}

        {props.showCloseButton && <HeaderCloseButton />}

        {false && (
          <HeaderTexts>
            {props.showLogo && false && <ScreenLogo />}
            {props.preSubTitle && (
              <ScreenPostTitle>{props.preSubTitle}</ScreenPostTitle>
            )}
            {props.subTitle && (
              <ScreenSubTitle>{props.subTitle}</ScreenSubTitle>
            )}
            {props.postSubTitle && (
              <ScreenPostTitle>{props.postSubTitle}</ScreenPostTitle>
            )}

            {/* support line breaks */}
            {props.title &&
              props.title.split("\n").map((item, key) => {
                return (
                  <ScreenTitle
                    key={key}
                    titleSize={props.titleSize}
                    titleWeight={props.titleWeight}
                    marginBottom={screenTitleMarginBottom}
                  >
                    {item}
                  </ScreenTitle>
                );
              })}

            {props.postTitle && (
              <ScreenPostTitle>{props.postTitle}</ScreenPostTitle>
            )}
          </HeaderTexts>
        )}

        {props.showGradient !== undefined && props.showGradient !== "none" && (
          <Gradient position="bottom" size={props.showGradient} />
        )}
      </ScreenHeaderStyle>

      {menu.items.map((menuItem, index) => {
        if (menuItem.itemType === "richtext" && isMenuItemOpen[index]) {
          return (
            <InformationWindow
              key={menuItem.name}
              onClose={() => {
                setMenuItemOpen(index, false);
              }}
            >
              <ReactMarkdown>{menuItem.text}</ReactMarkdown>
            </InformationWindow>
          );
        }
        return null;
      })}

      {/* == Terms == */}
      {termsModalIsOpen && <TermsModal onAgreeClick={handleAgreeTerms} />}
    </>
  );
};

ScreenHeader.defaultProps = {
  showMenuBurger: true,
  showCloseButton: false,
  showGradient: "none",
  titleSize: 82,
};

export { ScreenHeader };
