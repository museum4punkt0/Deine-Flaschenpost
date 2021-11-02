import styled from "styled-components";

import globalLayout from "../globals/layout";
import { global } from "../themes/global";
import { TextResize } from "./text-resize";

/***
 * A sub title element at the top of panels
 */

const PanelSubTitleStyle = styled(TextResize).attrs({
  textSize: 50,
})`
  text-align: center;
  font-family: ${global.fonts.title.family};
  font-style: italic;
  color: ${(props) => props.color};
`;

const PanelSubTitle = ({ children, ...rest }) => (
  <PanelSubTitleStyle color={globalLayout.titleColor} {...rest}>
    {children}
  </PanelSubTitleStyle>
);

export { PanelSubTitle };
