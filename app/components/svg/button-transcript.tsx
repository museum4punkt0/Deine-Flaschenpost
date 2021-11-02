import Image from "next/image";
import * as React from "react";

import globalLayout from "../../globals/layout";

const Skeleton = ({ src, ...rest }) => (
  <Image src={src} {...rest} layout="fill" />
);

const SvgButtonTranscript = (props) => (
  <Skeleton src={globalLayout.transcriptionIcon} {...props} />
);

export default SvgButtonTranscript;
