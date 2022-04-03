import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Link from "next/link";

import globalLayout from "../../globals/layout";
import { global, slideDownMenu } from "../../themes/global";
import { TextResize } from "../text-resize";
import SvgArrowUp from "../svg/arrow-up";
import { useRouter } from "next/router";

/***
 * Global menu
 */

// Burger bars
const MenuBurgerBar = styled.div`
  height: 3px;
  margin-bottom: 20%;
  background-color: white;
  border-radius: 25px;
`;

// Burger menu
const MenuBurgerStyle = styled.button`
  width: 8%;
  div:last-child {
    margin-bottom: 0%;
  }
`;

interface MenuBurgerProps {
  onClick: () => void; // Callback when the menu burger is clicked
}

const MenuBurger: React.FC<MenuBurgerProps> = ({ onClick }) => (
  <MenuBurgerStyle onClick={onClick} aria-label="menu">
    <MenuBurgerBar />
    <MenuBurgerBar />
    <MenuBurgerBar />
  </MenuBurgerStyle>
);

// Menu item
const MenuItemStyle = styled.button`
  padding: 6% 0;
  color: ${(props) => props.textColor};
  display: block;
  width: 100%;
  font-family: ${global.fonts.title.family};
  font-weight: ${global.fonts.title.bold};
  &:not(:last-child) {
    border-bottom: 0.1vh solid ${global.colour.veryLightGrey};
  }
`;

// Close menu MenuItem
const CloseMenuItem = styled.button`
  padding: 3% 0;
  display: block;
  width: 100%;
  opacity: 0.5;
`;

const CloseArrowUp = styled(SvgArrowUp)`
  max-width: 8%;
`;

interface MenuItemProps {
  onClick?: () => void; // Callback when the menu item is clicked
}

const MenuItem: React.FC<MenuItemProps> = (props) => (
  <MenuItemStyle onClick={props.onClick} textColor={globalLayout.promptColor}>
    <TextResize textSize={80}>{props.children}</TextResize>
  </MenuItemStyle>
);

const animationTime = 0.3;

// Menu wrapper
const MenuWrap = styled.div`
  background-color: rgba(0, 0, 0, 0.6);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 100;
  opacity: 0;
  transition: opacity ${animationTime}s ease;
  &.opened {
    opacity: 1;
  }
`;

// Menu
const MenuStyle = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background-color: white;
  font-family: ${global.fonts.title.family};
  font-weight: ${global.fonts.title.bold};
  text-align: center;
  /* animation: ${slideDownMenu}; */

  overflow: hidden;
  overflow-y: scroll;
  /* height:100%; */
  transition: transform ${animationTime}s ease;
  transform: translate(0, -100%);
  &.opened {
    transform: translate(0, 0%);
  }
`;

interface MenuProps {
  openPrivacy: () => void; // Callback to open privacy
  openImprint: () => void; // Callback to open privacy
  openHelp: () => void; // Callback to open help
  onCloseClick: () => void; // Callback when the close button is clicked
}

const Menu: React.FC<MenuProps> = (props) => {
  const router = useRouter();

  // State
  const [menuOpenedClass, setMenuOpenedClass] = useState(""); // Class used to determine opened state

  function handleCloseClick() {
    // Remove class to trigger css animation
    setMenuOpenedClass("");

    // Wait before closing to ensure CSS animation complete
    setTimeout(() => {
      if (props.onCloseClick) {
        props.onCloseClick();
      }
    }, animationTime * 1000);
  }

  // Initial menu animation class setup
  useEffect(() => {
    setMenuOpenedClass("opened");
  }, []);

  return (
    <MenuWrap className={menuOpenedClass} onClick={handleCloseClick}>
      <MenuStyle className={menuOpenedClass}>
        <Link href="/">
          <MenuItem
            onClick={() => {
              if (router.pathname == "/") {
                router.reload();
              }
            }}
          >
            Start
          </MenuItem>
        </Link>
        {props.menuItems.map((menuItem) => {
          if (menuItem.itemType === "richtext") {
            return (
              <MenuItem key={menuItem.name} onClick={menuItem.onClick}>
                {menuItem.name}
              </MenuItem>
            );
          } else {
            return (
              <MenuItem key={menuItem.name}>
                <a href={menuItem.url} target="_blank" rel="noreferrer">
                  {menuItem.name}
                </a>
              </MenuItem>
            );
          }
        })}
        <CloseMenuItem onClick={handleCloseClick} aria-label="close menu">
          <CloseArrowUp />
        </CloseMenuItem>
      </MenuStyle>
    </MenuWrap>
  );
};

export { Menu, MenuBurger };
