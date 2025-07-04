"use client";
import Image, { ImageProps } from "next/image";
import { useMemo, useState } from "react";

export default function SmartImage(props: ImageProps) {
  const [cacheBypass, setCacheBypass] = useState(false);

  const handleError = () => {
    setCacheBypass(true);
  };

  const finalSrc = useMemo(() => {
    return cacheBypass ? `${props.src}?t=${Date.now()}` : props.src;
  }, [cacheBypass, props.src]);

  return <Image {...props} src={finalSrc} onError={handleError} />;
}
