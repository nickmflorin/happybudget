import { Icon } from "components";
import IconButton, { IconButtonProps } from "./IconButton";

const AcceptButton = (props: Omit<IconButtonProps, "size" | "icon">): JSX.Element => {
  return (
    <IconButton
      {...props}
      className={"btn--accept"}
      size={"small"}
      icon={<Icon icon={"check-circle"} weight={"solid"} />}
    />
  );
};

export default AcceptButton;
