import { ReactNode } from "react";

interface VerticalFlexCenterProps {
  children: ReactNode;
}

const VerticalFlexCenter: React.FC<VerticalFlexCenterProps> = ({ children }) => {
  return <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>{children}</div>;
};

export default VerticalFlexCenter;
