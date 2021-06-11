export interface InfoBoxProps {}

const InfoBox: React.FunctionComponent<InfoBoxProps> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="rounded p-4 border border-gray-500">{children}</div>;
};

export default InfoBox;
