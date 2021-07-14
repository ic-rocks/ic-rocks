import React from "react";
import { useDarkMode } from "../../lib/hooks/useDarkMode";

export default function WaterMark() {
  const { value: isDark } = useDarkMode();
  return (
    <div
      style={{
        background: `no-repeat center/30% url(/img/icrocks-${
          isDark ? "dark" : "light"
        }.svg)`,
      }}
      className="absolute w-full h-full opacity-10 pointer-events-none"
    />
  );
}
