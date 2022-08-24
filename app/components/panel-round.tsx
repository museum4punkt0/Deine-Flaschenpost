import Image from "next/image";
import styled from "styled-components";
import globalLayout from "../globals/layout";
import { global } from "../themes/global";

/***
 * Consitent round shape
 */

export type PanelRoundBackgroundStyle =
  | "transparent-black"
  | "solid-white"
  | "none";
export type PanelRoundBorderStyle = "solid-red" | "solid-grey" | "none";

export interface Props {
  padding: string;
}

const PanelRoundStyle = styled.div<Props>`
  height: ${global.components.circle.width.vm};
  width: ${global.components.circle.width.vm};
  @media (min-width: ${global.desktop.startPixels}px) {
    height: ${global.components.circle.width.pixels};
    width: ${global.components.circle.width.pixels};
  }
  @media (max-height: 600px) {
    height: 55vmin;
    width: 55vmin;
  }
  @media (max-height: 500px) {
    height: 45vmin;
    width: 45vmin;
  }
  @media (max-height: 450px) {
    height: 40vmin;
    width: 40vmin;
  }
  @media (max-height: 380px) {
    height: 35vmin;
    width: 35vmin;
  }

  padding: ${(props) => props.padding || "5%"};
  margin: 0 auto;
  display: flex;
  z-index: 0;
  position: relative;
`;

const PanelImageContainer = styled.div`
  z-index: -1;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
`;

const PanelRound = ({ padding, hideImage, children, ...rest }) => (
  <PanelRoundStyle padding={padding} {...rest}>
    {!hideImage && (
      <PanelImageContainer>
        <Image src={globalLayout.promptCircle} layout="fill" />
      </PanelImageContainer>
    )}
    {children}
  </PanelRoundStyle>
);

PanelRound.defaultProps = {
  border: "none",
};

export { PanelRound };
