import React from "react";
import classNames from "classnames";
import { isNil } from "lodash";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import "./Spinner.scss";

interface SpinnerProps {
  antdSize?: "small" | "default" | "large";
  fontSize?: number;
  size?: number;
  className?: string;
  position?: "absolute" | "fixed" | "relative";
  style?: { [key: string]: any };
  relative?: boolean;
  absolute?: boolean;
  fixed?: boolean;
}

const Spinner = ({
  size,
  className,
  position = "absolute",
  antdSize = "small",
  fontSize = 24,
  style = {},
  relative,
  fixed,
  absolute
}: SpinnerProps): JSX.Element => {
  let _position: string;
  if (relative === true) {
    _position = "relative";
  } else if (absolute === true) {
    _position = "absolute";
  } else if (fixed === true) {
    _position = "fixed";
  } else {
    _position = position;
  }

  if (!isNil(size)) {
    style.height = `${size}px`;
    style.width = `${size}px`;
    // Don't override any set positions in the style object.
    if (isNil(style.left) && isNil(style.top) && isNil(style.right) && isNil(style.bottom)) {
      if (_position === "fixed") {
        style.left = `calc(50vw - ${0.5 * size}px)`;
        style.top = `calc(50vh - ${0.5 * size}px)`;
      }
    }
  }

  const loadingIcon = <LoadingOutlined style={{ ...style, fontSize: fontSize }} spin />;

  return (
    <Spin
      className={classNames(
        "spinner",
        { absolute: _position === "absolute" },
        { relative: _position === "relative" },
        { fixed: _position === "fixed" },
        className
      )}
      indicator={loadingIcon}
      size={antdSize}
      style={style}
    />
  );
};

export default Spinner;
