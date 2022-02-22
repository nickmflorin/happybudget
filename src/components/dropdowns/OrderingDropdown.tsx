import React, { useMemo } from "react";
import { find, isNil } from "lodash";
import classNames from "classnames";

import { OrderingArrowIcon } from "components/icons";
import DropdownMenu from "./DropdownMenu";

export interface OrderingDropdownProps<F extends string = string>
  extends Omit<IMenu<OrderingMenuItemState, OrderingMenuModel<F>>, "onChange"> {
  readonly ordering: Http.Ordering<F>;
  readonly onChange: (field: F, order: Http.Order) => void;
  readonly children: React.ReactChild | React.ReactChild[];
}

const OrderingDropdown = <F extends string = string>({
  ordering,
  onChange,
  ...props
}: OrderingDropdownProps<F>): JSX.Element => {
  const getItemState = useMemo(
    () =>
      (m: OrderingMenuModel<F>): OrderingMenuItemState => {
        const fieldOrder: Http.FieldOrder<F> | undefined = find(ordering, { field: m.id }) as
          | Http.FieldOrder<F>
          | undefined;
        if (isNil(fieldOrder)) {
          console.error(`Could not find ordering for field ${m.id} in state!`);
          return { order: 0 };
        }
        return { order: fieldOrder.order };
      },
    [ordering]
  );

  return (
    <DropdownMenu<OrderingMenuItemState, OrderingMenuModel<F>>
      {...props}
      getItemState={getItemState}
      keepDropdownOpenOnClick={true}
      menuClassName={classNames("ordering-menu", props.className)}
      onChange={(e: MenuChangeEvent<OrderingMenuItemState, OrderingMenuModel<F>>) => {
        const currentOrder: Http.FieldOrder<F> | undefined = find(ordering, { field: e.model.id }) as
          | Http.FieldOrder<F>
          | undefined;
        if (isNil(currentOrder)) {
          console.error(`Could not find ordering for field ${e.model.id} in state!`);
        } else {
          onChange(e.model.id, currentOrder.order === 0 ? -1 : currentOrder.order === -1 ? 1 : 0);
        }
      }}
      itemIconAfterLabel={(m: OrderingMenuModel<F>, s: OrderingMenuItemState) => <OrderingArrowIcon order={s.order} />}
    />
  );
};

export default React.memo(OrderingDropdown) as typeof OrderingDropdown;
