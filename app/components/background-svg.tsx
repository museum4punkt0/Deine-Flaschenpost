import React from "react";
import styled from "styled-components";
import Image from "next/image";

import { assertNever } from "../utils/helpers";
import { museum } from "../data";
import { BgSvgFullScreen } from "./svg/bg";
import { BgOrangeFullScreen } from "./bg-orange";
import { BgBLM } from "./bg-blm";

/***
 * Return the background SVG for the current museum
 */

const Background =
  museum.slug === "demo"
    ? BgSvgFullScreen
    : museum.slug === "brighton"
    ? BgSvgFullScreen
    : museum.slug === "munch"
    ? BgOrangeFullScreen
    : museum.slug === "mpu"
    ? BgSvgFullScreen
    : museum.slug === "blm"
    ? BgBLM
    : assertNever(museum.slug);

const BackgroundSvg: React.FC = ({ bg, logo }) => (
  <div>
    <BackgroundStyle>
      <Image src={bg} layout="fill" alt="Background" />
    </BackgroundStyle>
  </div>
);

// Styled SVG for fullscreen
const BackgroundStyle = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export { BackgroundSvg };
