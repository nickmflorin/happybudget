import React from "react";

import classNames from "classnames";

import { EntityText } from "components/typography";
import { EntityTextProps } from "components/typography/EntityText";

import Button, { ButtonProps } from "./Button";

export type EntityTextButtonProps = Omit<EntityTextProps, "className" | "style"> &
  Omit<ButtonProps, "children"> & {
    readonly fillEmpty?: string;
  };

const EntityTextButton = ({
  children,
  fillEmpty,
  ...props
}: EntityTextButtonProps): JSX.Element => (
  <Button
    {...props}
    className={classNames("btn--bare btn--entity-text", props.className)}
    withDropdownCaret={true}
  >
    <EntityText fillEmpty={fillEmpty}>{children}</EntityText>
  </Button>
);

export default React.memo(EntityTextButton);
