import React from "react";
import LogoDark from "@/public/logo-dark.png";
import LogoLight from "@/public/logo-light.png";
import { BRAND_NAME } from "@/lib/constants/brand";
import Image from "next/image";

type Props = {
  size?: "default" | "lg";
  className?: string;
};

export function Logo({ size: sizeRaw = "default", className }: Props) {
  const size = sizeRaw === "default" ? 40 : 60;
  return <Image src={LogoDark} alt={`Logo ${BRAND_NAME}`} width={size} height={size} className={className} />;
}
