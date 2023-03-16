import React from "react";

import { Icon } from "components";

import IconButton, { IconButtonProps } from "./IconButton";

const TrashButton = (props: Omit<IconButtonProps, "size" | "icon">): JSX.Element => (
  <IconButton {...props} className="btn--trash" icon={<Icon icon="trash-alt" />} />
);

export default React.memo(TrashButton);
