import React from "react";

import Icon from "./Icon";

type OrderingArrowIconProps = Omit<IIcon, "icon"> & {
  readonly order: Http.Order;
};

const OrderingArrowIcon = ({ order, ...props }: OrderingArrowIconProps): JSX.Element => {
  if (order === 1) {
    return <Icon {...props} icon={"arrow-down"} />;
  } else if (order === -1) {
    return <Icon {...props} icon={"arrow-up"} />;
  }
  return <Icon {...props} style={{ ...props.style, opacity: 0 }} icon={"arrow-down"} />;
};

export default React.memo(OrderingArrowIcon);
