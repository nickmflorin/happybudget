import { ReactNode } from "react";

interface VerticalFlexCenterProps extends StandardComponentProps {
  children: ReactNode;
}

const VerticalFlexCenter: React.FC<VerticalFlexCenterProps> = ({ children, className, style = {} }) => {
  return (
    <div className={className} style={{ ...style, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      {children}
    </div>
  );
};

export default VerticalFlexCenter;
