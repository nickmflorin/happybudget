import React from "react";

import classNames from "classnames";

import { ui } from "lib";
import { EntityText, EntityTextProps } from "components/typography";

import { BareButton, BareButtonProps } from "./BareButton";

export type EntityTextButtonProps = Omit<EntityTextProps, keyof ui.ComponentProps> &
  Omit<BareButtonProps, "children" | "dropdownCaret" | "icon" | "iconLocation">;

export const EntityTextButton = ({
  fillEmpty,
  description,
  identifier,
  model,
  ...props
}: EntityTextButtonProps): JSX.Element => (
  <BareButton
    {...props}
    className={classNames("button--entity-text", props.className)}
    dropdownCaret="right"
  >
    <EntityText
      fillEmpty={fillEmpty}
      model={model}
      identifier={identifier}
      description={description}
    />
  </BareButton>
);
