import React from "react";
import classNames from "classnames";
import { isNil } from "lodash";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import "./Spinner.scss";

export interface SpinnerProps {
  antdSize?: "small" | "default" | "large";
  size?: number;
  className?: string;
  position?: "absolute" | "fixed" | "relative";
  style?: { [key: string]: any };
  color?: string;
}

const Spinner = ({
  size,
  className,
  color,
  position = "absolute",
  antdSize = "small",
  style = {}
}: SpinnerProps): JSX.Element => {
  if (!isNil(size)) {
    style.height = `${size}px`;
    style.width = `${size}px`;
    // Don't override any set positions in the style object.
    if (isNil(style.left) && isNil(style.top) && isNil(style.right) && isNil(style.bottom)) {
      if (position === "fixed") {
        style.left = `calc(50vw - ${0.5 * size}px)`;
        style.top = `calc(50vh - ${0.5 * size}px)`;
      }
    }
  }
  if (!isNil(color)) {
    style.color = color;
  }
  const loadingIcon = <LoadingOutlined style={{ ...style }} spin />;

  return (
    <Spin
      className={classNames("spinner", position, className)}
      indicator={loadingIcon}
      size={antdSize}
      style={style}
    />
  );
};

export default Spinner;
