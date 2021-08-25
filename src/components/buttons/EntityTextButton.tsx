import { forwardRef } from "react";
import classNames from "classnames";

import { Icon, VerticalFlexCenter } from "components";
import { EntityText } from "components/typography";
import { EntityTextProps } from "components/typography/EntityText";
import Button, { ButtonProps } from "./Button";

export interface EntityTextButtonProps
  extends Omit<EntityTextProps, "className" | "style">,
    Omit<ButtonProps, "children"> {
  fillEmpty?: string;
  onClick?: () => void;
}

const EntityTextButton = ({ children, fillEmpty, ...props }: EntityTextButtonProps, ref: any): JSX.Element => {
  return (
    <Button {...props} ref={ref} className={classNames("btn--entity-text", props.className)}>
      <EntityText fillEmpty={fillEmpty}>{children}</EntityText>
      <VerticalFlexCenter className={"entity-text-button-caret"}>
        <Icon icon={"caret-down"} weight={"solid"} />
      </VerticalFlexCenter>
    </Button>
  );
};

export default forwardRef(EntityTextButton);
