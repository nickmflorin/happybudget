import * as api from "application/api";
import * as icons from "lib/ui/icons";

import { Icon } from "./Icon";

type OrderingArrowIconProps = Omit<icons.IconComponentProps, "icon"> & {
  readonly order: api.Order;
};

export const OrderingArrowIcon = ({ order, ...props }: OrderingArrowIconProps): JSX.Element => {
  if (order === 1) {
    return <Icon {...props} icon={icons.IconNames.ARROW_DOWN} />;
  } else if (order === -1) {
    return <Icon {...props} icon={icons.IconNames.ARROW_UP} />;
  }
  return (
    <Icon {...props} style={{ ...props.style, opacity: 0 }} icon={icons.IconNames.ARROW_DOWN} />
  );
};
