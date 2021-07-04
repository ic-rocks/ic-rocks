import React, { MouseEventHandler, ReactNode } from "react";
import { CgSpinner } from "react-icons/cg";

const SpinnerButton = ({
  isLoading,
  className,
  onClick,
  children,
}: {
  isLoading?: boolean;
  className?: string;
  onClick?: MouseEventHandler;
  children: ReactNode;
}) => {
  return (
    <button onClick={onClick} className={className} disabled={isLoading}>
      {isLoading ? (
        <CgSpinner className="inline-block animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};

export default SpinnerButton;
