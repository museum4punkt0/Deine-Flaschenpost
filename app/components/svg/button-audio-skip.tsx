import Image from "next/image";
import * as React from "react";
import globalLayout from "../../globals/layout";

const Skeleton = ({ src, ...rest }) => (
  <Image src={src} {...rest} layout="fill" />
);

const SvgButtonAudioSkip = (props) => (
  <Skeleton src={globalLayout.skipButtonIcon} {...props} />
);

export default SvgButtonAudioSkip;
