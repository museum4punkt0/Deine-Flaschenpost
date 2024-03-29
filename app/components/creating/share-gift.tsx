import React, { useState } from "react";
import styled from "styled-components";
import Image from "next/image";

import globalLayout from "../../globals/layout";

import { global } from "../../themes/global";
import { isIosDevice } from "../../utils/helpers";

import { Panel, PanelContent } from "../panel";
import { PanelTitle } from "../panel-title";
import { PanelButtons } from "../panel-buttons";
import { Button } from "../buttons";
import { TextResize } from "../text-resize";
import { FeedbackModal } from "../modals/feedback-modal";
import { WaitThen } from "../utils/wait-then";

import SvgIconSms from "../svg/icon-sms";
import SvgIconEmail from "../svg/icon-email";
import SvgIconWhatsApp from "../svg/icon-whatsapp";
import SvgIconMessenger from "../svg/icon-messenger";
import SvgArrowForward from "../svg/arrow-forward";

/**
 * Component that allows a gift to be shared
 */

const SharesContent = styled(PanelContent)`
  width: 100%;
`;

const Shares = styled.div`
  margin: 1vh 0 0;
  padding: 0 3%;
  width: 100%;
`;

// Share link
const ShareLinkStyle = styled.a`
  display: flex;
  margin-bottom: 2vh;
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.7);
  position: relative;
  z-index: 1;
  @media (max-width: 375px) {
    padding: 1px 1px;
  }
  padding: 8px 8px;
  border-radius: ${global.borderRadius};
  width: 100%;
  text-align: center;
  align-items: center;
`;

const ShareLinkIcon = styled.div`
  @media (max-width: 1440px) {
    width: 80px;
    padding-bottom: 3rem;
  }
  @media (max-width: 375px) {
    width: 20%;
    padding-bottom: 20%;
  }
  @media (max-height: 650px) {
    width: 15%;
    padding-bottom: 15%;
  }
  @media (max-height: 500px) {
    width: 10%;
    padding-bottom: 12.5%;
  }
  @media (max-height: 450px) {
    width: 10%;
    padding-bottom: 9%;
  }
  @media (max-height: 380px) {
    width: 8%;
    padding-bottom: 6%;
  }
  width: 25%;
  padding-bottom: 17.5%;
  position: relative;
  height: 0;
  margin-left: 5%;
`;

const ShareLinkText = styled.div`
  width: 100%;
  font-family: ${global.fonts.title.family};
  font-weight: ${global.fonts.title.normal};
  color: ${(props) => props.textColor};
`;

const ShareLinkArrow = styled.div`
  width: 10%;
  margin-left: 5%;
  opacity: 0.7;
`;

interface ShareLinkProps {
  icon: JSX.Element;
  text: string;
  url: string;
  dataAction?: string; // data-target attribute for anchor
  onClick?: () => void;
}

export const ShareLink: React.FC<ShareLinkProps> = ({
  icon,
  text,
  url,
  dataAction,
  onClick,
}) => {
  return (
    <ShareLinkStyle
      href={url}
      target="_blank"
      data-action={dataAction}
      onClick={onClick}
    >
      <ShareLinkIcon>{icon}</ShareLinkIcon>
      <ShareLinkText textColor={globalLayout.promptColor}>
        <TextResize textSize={50}>{text}</TextResize>
      </ShareLinkText>
    </ShareLinkStyle>
  );
};

// Share component
interface ShareGiftProps {
  senderName: string;
  recipientName: string;
  url: string;
  onChannelClicked: (
    channel: "sms" | "email" | "whatsapp" | "messenger"
  ) => void;
  onComplete: () => void;
  content: any;
}

export const ShareGift: React.FC<ShareGiftProps> = ({
  senderName,
  recipientName,
  url,
  onChannelClicked,
  onComplete,
  content,
}) => {
  // State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // String templates
  const shareText = content.shareText;
  const emailSubject = content.emailSubject;
  const emailBody = content.emailBody
    .replace("${recipientName}", recipientName)
    .replace("${url}", url)
    .replace("${senderName}", senderName);
  const emailText = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  // Prepare all of the URLS
  const emailLink = encodeURI(emailText).replace(/\,/g, "%2C");
  const fbMessengerLink = encodeURI(`fb-messenger://share/?link=${url}`);
  const whatsAppsLink = encodeURI(`whatsapp://send?text=${shareText} ${url}`);

  // Different format for iOS SMS
  const iosSmsLink = encodeURI(`sms:&body=${shareText} ${url}`);
  const androidSmsLink = encodeURI(`sms:?&body=${shareText} ${url}`);
  const smsLink = isIosDevice() ? iosSmsLink : androidSmsLink;

  return (
    <Panel>
      <WaitThen
        wait={2 * 60 * 1000}
        andThen={() => {
          setShowFeedbackModal(true);
        }}
      />
      {content.feedbackUrl && showFeedbackModal && (
        <FeedbackModal
          feedbackUrl={content.feedbackUrl}
          onFinished={() => {
            setShowFeedbackModal(false);
          }}
        />
      )}

      <PanelTitle>{content.title}</PanelTitle>

      <SharesContent>
        <Shares>
          <ShareLink
            url={smsLink}
            text="SMS"
            icon={
              <Image
                src={globalLayout.smsIcon}
                alt="SMS"
                layout="fill"
                objectFit="contain"
              />
            }
            onClick={() => onChannelClicked("sms")}
          />

          <ShareLink
            url={emailLink}
            text="E-Mail"
            icon={
              <Image
                src={globalLayout.mailIcon}
                alt="Mail"
                layout="fill"
                objectFit="contain"
              />
            }
            onClick={() => onChannelClicked("email")}
          />

          <ShareLink
            url={whatsAppsLink}
            text="WhatsApp"
            icon={
              <Image
                src={globalLayout.whatsappIcon}
                alt="WhatsApp"
                layout="fill"
                objectFit="contain"
              />
            }
            dataAction="share/whatsapp/share"
            onClick={() => onChannelClicked("whatsapp")}
          />

          <ShareLink
            url={fbMessengerLink}
            text="Messenger"
            icon={
              <Image
                src={globalLayout.messengerIcon}
                alt="Messenger"
                layout="fill"
                objectFit="contain"
              />
            }
            onClick={() => onChannelClicked("messenger")}
          />
        </Shares>
      </SharesContent>

      <PanelButtons>
        <Button onClick={onComplete}>{content.continueButtonText}</Button>
      </PanelButtons>
    </Panel>
  );
};
