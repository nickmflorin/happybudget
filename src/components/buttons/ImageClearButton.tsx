import React from "react";
import { Icon } from "components";
import IconButton, { IconButtonProps } from "./IconButton";

const ImageClearButton = (props: Omit<IconButtonProps, "icon">): JSX.Element => (
  <IconButton {...props} className={"btn--clear-image"} icon={<Icon icon={"times-circle"} weight={"solid"} />} />
);

export default React.memo(ImageClearButton);
