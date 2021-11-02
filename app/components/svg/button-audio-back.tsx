import Image from "next/image";
import * as React from "react";

import globalLayout from "../../globals/layout";

const Skeleton = ({ src, ...rest }) => (
  <Image src={src} {...rest} layout="fill" />
);

const SvgButtonAudioBack = (props) => (
  <Skeleton src={globalLayout.repeatButtonIcon} {...props} />
);

export default SvgButtonAudioBack;
