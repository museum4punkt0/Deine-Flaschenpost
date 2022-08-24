import styled from "styled-components";

import { TextResize } from "./text-resize";

import globalLayout from "../globals/layout";

interface Props {
  textSize?: number;
}

// Pass through to TextResize
const PanelTextStyle = styled(TextResize).attrs<Props>((props) => ({
  textSize: props.textSize || 50,
}))`
  color: ${(props) => props.color};
  text-align: center;
  font-weight: 300;
  padding: 0 5%;
  line-height: 1.1;
  width: 100%;
  @media (max-height: 600px) {
    font-size: 3.5vw;
  }
  @media (max-height: 450px) {
    font-size: 3vw;
  }
  @media (max-height: 380px) {
    font-size: 2.5vw;
  }
`;

const PanelText = ({ children, ...rest }) => (
  <PanelTextStyle color={globalLayout.promptColor} {...rest}>
    {children}
  </PanelTextStyle>
);

export { PanelText };
