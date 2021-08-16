import { ReactNode } from "react";

interface HorizontalFlexCenterProps extends StandardComponentProps {
  children: ReactNode;
}

const HorizontalFlexCenter: React.FC<HorizontalFlexCenterProps> = ({ children, className, style = {} }) => {
  return (
    <div
      className={className}
      style={{
        ...style,
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {children}
    </div>
  );
};

export default HorizontalFlexCenter;
