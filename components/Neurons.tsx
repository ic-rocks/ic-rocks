import classNames from "classnames";
import { ReactNode } from "react";
import { NeuronState } from "../lib/types/governance";

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
      })}
    >
      {children || NeuronState[state]}
    </span>
  );
};
