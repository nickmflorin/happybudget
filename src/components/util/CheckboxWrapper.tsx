import React, { ReactNode, useMemo } from "react";
import classNames from "classnames";

interface CheckboxWrapperProps extends StandardComponentProps {
  children: ReactNode;
  noLeftPadding?: boolean;
  noRightPadding?: boolean;
}

const CheckboxWrapper: React.FC<CheckboxWrapperProps> = ({
  children,
  noLeftPadding,
  noRightPadding,
  className,
  style = {}
}) => {
  const _style = useMemo(() => {
    let newStyle = { ...style };
    if (noLeftPadding === true) {
      newStyle = { ...newStyle, marginLeft: -10 };
    }
    if (noRightPadding === true) {
      newStyle = { ...newStyle, marginRight: -10 };
    }
    return newStyle;
  }, [style, noLeftPadding, noRightPadding]);

  return (
    <div className={classNames("checkbox-wrapper", className)} style={_style}>
      {children}
    </div>
  );
};

export default CheckboxWrapper;
