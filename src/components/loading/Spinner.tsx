import React, { useMemo } from "react";
import classNames from "classnames";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import "./Spinner.scss";

type SpinnerSize = "xsmall" | "small" | "medium" | "large" | "xlarge";

/* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
const DefaultSizeMap: { [key in SpinnerSize]: number } = {
  xsmall: 15,
  small: 20,
  medium: 25,
  large: 30,
  xlarge: 35
};

export interface SpinnerProps extends StandardComponentProps {
  readonly size?: number | SpinnerSize;
  readonly color?: Style.HexColor;
  readonly large?: boolean;
  readonly medium?: boolean;
  readonly small?: boolean;
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
  const baseSize = useMemo<number | SpinnerSize>(() => {
    if (large === true) {
      return "large";
    } else if (medium === true) {
      return "medium";
    } else if (small === true) {
      return "small";
    }
    return size;
  }, [size, small, medium, large]);

  const numericSize = useMemo(() => {
    if (typeof baseSize === "number") {
      return baseSize;
    } else {
      return DefaultSizeMap[baseSize];
    }
  }, [baseSize]);

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

export default React.memo(Spinner);
