import React, { ReactNode } from "react";
import { BsCheck } from "react-icons/bs";
import SpinnerButton from "./SpinnerButton";

const CheckButton = ({
  isChecked,
  isLoading,
  className,
  children,
}: {
  isChecked?: boolean;
  isLoading?: boolean;
  className?: string;
  children: ReactNode;
}) => {
  return isLoading ? (
    <SpinnerButton isLoading={true} className={className}>
      {children}
    </SpinnerButton>
  ) : (
    <button className={className} disabled={isChecked}>
      {isChecked ? <BsCheck className="inline-block" /> : children}
    </button>
  );
};

export default CheckButton;
