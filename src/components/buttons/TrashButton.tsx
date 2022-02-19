import React from "react";
import { Icon } from "components";
import IconButton, { IconButtonProps } from "./IconButton";

const TrashButton = (props: Omit<IconButtonProps, "size" | "icon">): JSX.Element => {
  return <IconButton {...props} className={"btn--trash"} size={"medium"} icon={<Icon icon={"trash-alt"} />} />;
};

export default React.memo(TrashButton);
