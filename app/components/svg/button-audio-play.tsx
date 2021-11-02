import Image from "next/image";
import * as React from "react";

import globalLayout from "../../globals/layout";

const Skeleton = ({ src, ...rest }) => (
  <Image src={src} {...rest} layout="fill" />
);

const SvgButtonAudioPlay = (props) => (
  <Skeleton src={globalLayout.playButtonIcon} {...props} />
);

export default SvgButtonAudioPlay;
