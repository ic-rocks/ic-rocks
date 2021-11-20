import classNames from "classnames";
import React, { ReactNode } from "react";
import { NeuronState } from "../../lib/types/governance";

export const NeuronLabel = ({
  state,
  children,
}: {
  state: NeuronState;
  children?: ReactNode;
}) => {
  return (
    <span
      className={classNames({
        "text-gray-500": state === NeuronState.Dissolved,
        "text-yellow-600 dark:text-yellow-400": state === NeuronState.Donated,
      })}
    >
      {children || NeuronState[state]}
    </span>
  );
};
