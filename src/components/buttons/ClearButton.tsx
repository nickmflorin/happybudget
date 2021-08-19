import { Icon } from "components";
import IconButton, { IconButtonProps } from "./IconButton";

const ClearButton = (props: Omit<IconButtonProps, "size" | "icon">): JSX.Element => {
  return (
    <IconButton
      {...props}
      className={"btn btn--clear"}
      size={"small"}
      icon={<Icon icon={"times-circle"} weight={"solid"} />}
    />
  );
};

export default ClearButton;
