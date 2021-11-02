import React from "react";
import { useRouter, NextRouter } from "next/router";
import styled from "styled-components";
import { Textfit } from "react-textfit";

import globalLayout from "../../globals/layout";
import { assertNever } from "../../utils/helpers";
import { events } from "../../services";
import {
  rAtMuseumConfirmedEvent,
  rOpenPressedEvent,
} from "../../event-definitions";

import { Gift } from "../../domain";
import { GlobalStyles, global } from "../../themes/global";
import { ScreenManager } from "../screen-manager";
import { TextResize } from "../text-resize";
import { ScreenHeader } from "../screen-header";
import { GiftPartsManager } from "./gift-parts-manager";
import { ChooseLocation, RecipientLocation } from "../choose-location";
import { Button } from "../buttons";
import { ReceivingOpenGift } from "./open-gift";
import { Panel, PanelContent } from "../panel";
import { PanelButtons } from "../panel-buttons";
import { PanelPrompt } from "../panel-prompt";
import { BackgroundSvg } from "../../components/background-svg";
import {
  getSessionRecipientLocation,
  setSessionRecipientLocation,
} from "../../utils/local";

/**
 * Gift Receive screen top level component
 */

export const MainTitle = styled(TextResize).attrs({
  textSize: 40,
})`
  z-index: 1;
  text-align: center;
  font-family: ${global.fonts.title.family};
  font-weight: ${global.fonts.title.bold};
  color: white;
  margin: 5vh 0 0;
`;

export const MuseumName = styled(Textfit).attrs({ mode: "single" })`
  z-index: 1;
  width: 90%;
  text-align: center;
  font-family: ${global.fonts.title.family};
  font-weight: ${global.fonts.title.bold};
  color: white;
  line-height: 0.9;
`;

// Current status of this screen
type ReceiveGiftStatus =
  | "Welcome"
  | "SelectLocation"
  | "OpenOrSave"
  | "ShowingParts";

interface Props {
  gift: Gift;
  router: NextRouter;
  content: any;
}

interface State {
  status: ReceiveGiftStatus;
  recipientLocation: RecipientLocation;
  compactHeader: boolean;
}

const ReceiveGift = (props) => {
  const router = useRouter();
  return <ReceiveGiftNoRouter {...props} router={router} />;
};

class ReceiveGiftNoRouter extends React.PureComponent<Props, State> {
  public state: State = {
    status: "Welcome",
    recipientLocation: getSessionRecipientLocation(), // Default to the stored session value
    compactHeader: false,
  };

  public handleOpenClicked = () => {
    events.track(rOpenPressedEvent(this.props.gift.id));

    if (this.state.recipientLocation === "unknown") {
      this.setState({ status: "SelectLocation" });
    } else {
      this.setState({ status: "ShowingParts" });
    }
  };

  public handleOpenAnywayClicked = () => {
    this.setCompactHeader();
    this.setState({
      status: "ShowingParts",
    });
  };

  public handleSetLocation = (recipientLocation: RecipientLocation) => {
    if (recipientLocation === "at-museum")
      events.track(rAtMuseumConfirmedEvent(this.props.gift.id, true));
    if (recipientLocation === "not-at-museum")
      events.track(rAtMuseumConfirmedEvent(this.props.gift.id, false));

    setSessionRecipientLocation(recipientLocation);

    // Determine the next stage based on the location
    const nextStage: ReceiveGiftStatus =
      recipientLocation === "not-at-museum" ? "OpenOrSave" : "ShowingParts";

    // Store this
    this.setState({
      recipientLocation,
      status: nextStage,
    });
  };

  public handleSaveForLaterClicked = () => {
    // Go to the homepage
    this.props.router.push("/");
  };

  public setCompactHeader = () => {
    this.setState({
      compactHeader: true,
    });
  };

  // Return the correct content based on status
  public renderContent() {
    switch (this.state.status) {
      case "Welcome":
        return this.renderWelcome();
      case "OpenOrSave":
        return this.renderOpenOrSave();
      case "SelectLocation":
        return this.renderSelectLocation();
      case "ShowingParts":
        return this.renderGiftParts();
      default:
        return assertNever(this.state.status);
    }
  }

  public renderWelcome() {
    return (
      <ReceivingOpenGift
        onComplete={this.handleOpenClicked}
        content={this.props.content.openGift}
      />
    );
  }

  public renderOpenOrSave() {
    return (
      <Panel>
        <PanelContent>
          <PanelPrompt
            text={this.props.content.openOrSave.questionText}
            background={"transparent-black"}
          />
        </PanelContent>
        <PanelButtons>
          <Button onClick={this.handleOpenAnywayClicked} primary={true}>
            {this.props.content.openOrSave.openNowText}
          </Button>
          <Button onClick={this.handleSaveForLaterClicked}>
            {this.props.content.openOrSave.saveForLaterText}
          </Button>
        </PanelButtons>
      </Panel>
    );
  }

  public renderGiftParts() {
    return (
      <GiftPartsManager
        gift={this.props.gift}
        recipientLocation={this.state.recipientLocation}
        content={this.props.content.parts}
      />
    );
  }

  public renderSelectLocation() {
    return (
      <ChooseLocation
        onLocationSelected={this.handleSetLocation}
        content={this.props.content.chooseLocation}
      />
    );
  }

  public render() {
    const { status, compactHeader } = this.state;

    // The header size is based on our current state
    const headerSize = compactHeader
      ? "compact"
      : status === "Welcome" ||
        status === "SelectLocation" ||
        status === "OpenOrSave"
      ? "big"
      : "small";

    return (
      <ScreenManager>
        <BackgroundSvg bg={globalLayout.backgroundImage} />
        <GlobalStyles />

        {headerSize === "big" && (
          <>
            <ScreenHeader showLogo={false} />
            <MainTitle>{this.props.content.global.title}</MainTitle>
            <MuseumName>{this.props.gift.senderName}</MuseumName>
          </>
        )}
        {headerSize === "small" && (
          <ScreenHeader
            postSubTitle={this.props.content.global.compactTitle}
            title={this.props.gift.senderName}
            showLogo={true}
          />
        )}
        {headerSize === "compact" && (
          <ScreenHeader
            postSubTitle={this.props.content.global.compactTitle}
            title={this.props.gift.senderName}
            showLogo={false}
            background="white"
          />
        )}

        {this.renderContent()}
      </ScreenManager>
    );
  }
}

export { ReceiveGift };
