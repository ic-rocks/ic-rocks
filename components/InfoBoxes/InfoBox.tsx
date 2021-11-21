// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InfoBoxProps {}
import React from "react";

const InfoBox: React.FunctionComponent<InfoBoxProps> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="p-4 rounded border border-gray-500">{children}</div>;
};

export default InfoBox;
