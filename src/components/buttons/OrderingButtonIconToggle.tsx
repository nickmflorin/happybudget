import { useMemo } from "react";

import { find } from "lodash";

import { api } from "application";
import { ui } from "lib";
import { Icon, OrderingArrowIcon } from "components/icons";

import {
  SecondaryButtonIconToggle,
  SecondaryButtonIconToggleProps,
} from "./SecondaryButtonIconToggle";

export interface OrderingButtonIconToggleProps<F extends string = string>
  extends Omit<SecondaryButtonIconToggleProps, "icon" | "children" | "breakpointIcon"> {
  readonly ordering: api.Ordering<F>;
  readonly labelMap: { [key in F]: string };
}

export const OrderingButtonIconToggle = <F extends string = string>({
  ordering,
  labelMap,
  ...props
}: OrderingButtonIconToggleProps<F>): JSX.Element => {
  const order = useMemo(() => find(ordering, (o: api.FieldOrder<F>) => o.order !== 0), [ordering]);

  const label = useMemo(
    () => (order === undefined ? "Order By" : labelMap[order.field] || "Order By"),
    [order, labelMap],
  );

  const sortIcon = useMemo(() => {
    if (order !== undefined) {
      return <OrderingArrowIcon order={order.order} />;
    }
    return <Icon icon={ui.IconNames.FILTER} />;
  }, [order]);

  return (
    <SecondaryButtonIconToggle
      {...props}
      style={{ ...props.style, width: "auto" }}
      breakpointStyle={props.style}
      icon={sortIcon}
      breakpointIcon={<Icon icon={ui.IconNames.SORT_AMOUNT_DOWN} />}
    >
      {label}
    </SecondaryButtonIconToggle>
  );
};
