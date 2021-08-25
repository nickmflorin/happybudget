import { forwardRef } from "react";
import classNames from "classnames";

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
    <Button
      {...props}
      ref={ref}
      className={classNames("btn--bare btn--entity-text", props.className)}
      withDropdownCaret={true}
    >
      <EntityText fillEmpty={fillEmpty}>{children}</EntityText>
    </Button>
  );
};

export default forwardRef(EntityTextButton);
