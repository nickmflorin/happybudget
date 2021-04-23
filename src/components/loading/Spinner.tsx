import { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import "./Spinner.scss";

const DefaultSizeMap = {
  small: 25,
  medium: 35,
  large: 45
};

export interface SpinnerProps extends StandardComponentProps {
  size?: number | "small" | "medium" | "large";
  color?: string;
  large?: boolean;
  medium?: boolean;
  small?: boolean;
}

const Spinner = ({
  size = "medium",
  className,
  color,
  small,
  medium,
  large,
  style = {}
}: SpinnerProps): JSX.Element => {
  const numericSize = useMemo(() => {
    let baseSize = size;
    if (large === true) {
      baseSize = "large";
    } else if (medium === true) {
      baseSize = "medium";
    } else if (small === true) {
      baseSize = "small";
    }
    let sizeNumber: number = 25;
    if (typeof baseSize === "string" && !isNil(DefaultSizeMap[baseSize])) {
      sizeNumber = DefaultSizeMap[baseSize];
    } else if (!isNil(size) && typeof size === "number") {
      sizeNumber = size;
    }
    return sizeNumber;
  }, []);

  const spinnerStyle = useMemo(() => {
    const st: React.CSSProperties = { ...style };
    st.height = `${numericSize}px`;
    st.width = `${numericSize}px`;
    return st;
  }, [numericSize]);

  return (
    <Spin
      className={classNames("spinner", className)}
      indicator={<LoadingOutlined style={{ color: color }} spin />}
      style={spinnerStyle}
    />
  );
};

export default Spinner;
