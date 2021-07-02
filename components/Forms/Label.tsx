import classNames from "classnames";
import React from "react";

export const Label = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <label
    className={classNames(className, "block text-xs italic text-gray-500")}
  >
    {children}
  </label>
);
