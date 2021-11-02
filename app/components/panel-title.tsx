import styled from "styled-components";

import globalLayout from "../globals/layout";
import { global } from "../themes/global";
import { TextResize } from "./text-resize";

/***
 * A sub title element at the top of panels
 */

interface Props {
  textSize?: number;
}

const PanelTitleStyle = styled(TextResize).attrs<Props>((props) => ({
  textSize: props.textSize || 60,
}))`
  text-align: center;
  font-family: ${global.fonts.title.family};
  font-weight: ${global.fonts.title.bold};
  margin: 5% 0 1% 0;
  color: ${(props) => props.color};
`;

const PanelTitle = ({ children, ...rest }) => (
  <PanelTitleStyle color={globalLayout.titleColor} {...rest}>
    {children}
  </PanelTitleStyle>
);

export { PanelTitle };
