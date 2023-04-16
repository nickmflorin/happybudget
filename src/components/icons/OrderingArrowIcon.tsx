import { api } from "application";
import { ui } from "lib";

import { Icon } from "./Icon";

type OrderingArrowIconProps = Omit<ui.IconComponentProps, "icon"> & {
  readonly order: api.Order;
};

export const OrderingArrowIcon = ({ order, ...props }: OrderingArrowIconProps): JSX.Element => {
  if (order === 1) {
    return <Icon {...props} icon={ui.IconNames.ARROW_DOWN} />;
  } else if (order === -1) {
    return <Icon {...props} icon={ui.IconNames.ARROW_UP} />;
  }
  return <Icon {...props} style={{ ...props.style, opacity: 0 }} icon={ui.IconNames.ARROW_DOWN} />;
};
