import { ReactNode } from "react";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

import { Button } from "antd";
import { ButtonProps } from "antd/lib/button";

interface CaretButtonProps extends ButtonProps {
  className?: string;
  children: ReactNode;
}

const CaretButton = ({ children, className, ...props }: CaretButtonProps): JSX.Element => {
  return (
    <Button className={classNames("btn--caret", className)} {...props}>
      <div className={"caret-button-inner"}>
        <div className={"caret-button-text"}>{children}</div>
        <div className={"caret-button-caret"}>
          <FontAwesomeIcon icon={faCaretDown} />
        </div>
      </div>
    </Button>
  );
};

export default CaretButton;
