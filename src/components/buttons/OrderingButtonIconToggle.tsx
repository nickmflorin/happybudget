import { useMemo } from "react";
import { find } from "lodash";

import { ui } from "lib";

import { Icon } from "components";

import DefaultButtonIconToggle, { DefaultButtonIconToggleProps } from "./DefaultButtonIconToggle";

export interface OrderingButtonIconToggleProps
  extends Omit<DefaultButtonIconToggleProps, "icon" | "breakpoint" | "children"> {
  readonly ordering: Http.Ordering;
  readonly labelMap: { [key: string]: string };
}

const OrderingButtonIconToggle = ({ ordering, labelMap, ...props }: OrderingButtonIconToggleProps): JSX.Element => {
  const isMobile = ui.hooks.useLessThanBreakpoint("medium");

  const order = useMemo(() => find(ordering, (o: Http.FieldOrder) => o.order !== 0), [ordering]);

  const label = useMemo(() => {
    return order === undefined ? "Order By" : labelMap[order.field] || "Order By";
  }, [ordering]);

  const sortIcon = useMemo(() => {
    if (order !== undefined) {
      if (order.order === 1) {
        return <Icon style={{ width: "10px" }} icon={"arrow-up"} weight={"light"} />;
      } else if (order.order === -1) {
        return <Icon style={{ width: "10px" }} icon={"arrow-down"} weight={"light"} />;
      }
      return <Icon style={{ opacity: 0 }} icon={"arrow-down"} weight={"light"} />;
    }
    return <Icon icon={"bars-filter"} weight={"light"} />;
  }, [ordering]);

  return (
    <DefaultButtonIconToggle
      {...props}
      style={{ ...props.style, width: isMobile ? "auto" : "160px" }}
      icon={sortIcon}
      breakpoint={"medium"}
    >
      {label}
    </DefaultButtonIconToggle>
  );
};

export default OrderingButtonIconToggle;
