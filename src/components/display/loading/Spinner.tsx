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
  position?: "absolute" | "fixed" | "relative";
  color?: string;
  fixed?: boolean;
  large?: boolean;
  medium?: boolean;
  small?: boolean;
}

const Spinner = ({
  size = "medium",
  fixed,
  className,
  color,
  small,
  medium,
  large,
  position = "fixed",
  style = {}
}: SpinnerProps): JSX.Element => {
  const spinnerPosition = useMemo(() => {
    if (fixed === true) {
      return "fixed";
    }
    return position;
  }, [position, fixed]);

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
  }, [position, fixed]);

  const spinnerStyle = useMemo(() => {
    const st: React.CSSProperties = { ...style };
    st.height = `${numericSize}px`;
    st.width = `${numericSize}px`;

    // Don't override any set positions in the style object.
    if (isNil(st.left) && isNil(st.top) && isNil(st.right) && isNil(st.bottom)) {
      if (spinnerPosition === "fixed") {
        style.left = `calc(50vw - ${0.5 * numericSize}px)`;
        style.top = `calc(50vh - ${0.5 * numericSize}px)`;
      } else if (spinnerPosition === "absolute") {
        style.left = `calc(50% - ${0.5 * numericSize}px)`;
        style.top = `calc(50% - ${0.5 * numericSize}px)`;
      }
    }
    return st;
  }, [numericSize, spinnerPosition]);

  return (
    <Spin
      className={classNames("spinner", position, className)}
      indicator={<LoadingOutlined style={{ color: color }} spin />}
      style={spinnerStyle}
    />
  );
};

export default Spinner;
