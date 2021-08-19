import { ReactNode } from "react";
import classNames from "classnames";

import { Icon } from "components";
import Button, { ButtonProps } from "./Button";

export interface CaretButtonProps extends ButtonProps {
  readonly solid?: boolean;
  readonly textProps?: StandardComponentProps;
}

interface _CaretButtonProps extends CaretButtonProps {
  readonly children: ReactNode;
}

const CaretButton = ({ children, textProps = {}, solid = false, ...props }: _CaretButtonProps): JSX.Element => {
  return (
    <Button {...props} className={classNames("btn--caret", { primary: solid }, props.className)}>
      <div className={"caret-button-inner"}>
        <div className={classNames("caret-button-text", textProps.className)} {...textProps}>
          {children}
        </div>
        <div className={"caret-button-caret"}>
          <Icon icon={"caret-down"} weight={"solid"} />
        </div>
      </div>
    </Button>
  );
};

export default CaretButton;
