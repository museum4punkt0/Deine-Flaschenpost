import React from "react";
import styled from "styled-components";

import globalLayout from "../../globals/layout";
import { global } from "../../themes/global";
import { ModalDialogOuter } from "./base-modal-dialog";
import { Button, Buttons } from "../buttons";
import { TextResize } from "../text-resize";

import { museum } from "../../data";

/**
 * Terms & privacy modal
 */

const Inner = styled.div`
  background-color: white;
  position: absolute;
  bottom: 0;
`;

const Texts = styled.div`
  text-align: center;
  padding: 5% 5% 4%;
  a {
    color: ${global.colour.darkRed};
    opacity: 0.7;
  }
`;

const TopText = styled(TextResize)`
  color: black;
  font-weight: 500;
  margin-bottom: 3%;
  line-height: 1.2;
`;

const MainText = styled(TextResize)`
  color: ${global.colour.lightGreyText};
  margin-bottom: 5%;
  line-height: 1.2;
`;

const TermsButton = styled.button`
  margin-bottom: 2%;
  color: ${global.colour.darkRed};
  opacity: 0.7;
`;

interface Props {
  onAgreeClick: () => void; // Callback when the agree button is clicked
  onShowTerms: () => void; // Callback when the show terms button is clicked
}

const TermsModal: React.FC<Props> = ({ onAgreeClick, onShowTerms }) => {
  return (
    <ModalDialogOuter>
      <Inner>
        <Texts>
          <>
            <TopText textSize={35}>{globalLayout.termsModalTitle}</TopText>

            <MainText textSize={35}>{globalLayout.termsModalText}</MainText>
          </>

          <TermsButton onClick={onShowTerms}>
            <TextResize textSize={40}>
              {globalLayout.termsModalReadButtonText}
            </TextResize>
          </TermsButton>
        </Texts>

        <Buttons>
          <Button onClick={onAgreeClick} colour="light-grey">
            {globalLayout.termsModalAgreeButtonText}
          </Button>
        </Buttons>
      </Inner>
    </ModalDialogOuter>
  );
};

export { TermsModal };
