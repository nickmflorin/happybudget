import React, { ReactNode } from "react";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

import { Button } from "antd";
import { ButtonProps } from "antd/lib/button";

export interface CaretButtonProps extends ButtonProps {
  className?: string;
  solid?: boolean;
  style?: React.CSSProperties;
  textProps?: StandardComponentProps;
}

interface _CaretButtonProps extends CaretButtonProps {
  children: ReactNode;
}

const CaretButton = ({
  children,
  className,
  textProps = {},
  style = {},
  solid = false,
  ...props
}: _CaretButtonProps): JSX.Element => {
  return (
    <Button className={classNames("btn btn--caret", { primary: solid }, className)} style={style} {...props}>
      <div className={"caret-button-inner"}>
        <div className={classNames("caret-button-text", textProps.className)} {...textProps}>
          {children}
        </div>
        <div className={"caret-button-caret"}>
          <FontAwesomeIcon icon={faCaretDown} />
        </div>
      </div>
    </Button>
  );
};

export default CaretButton;
