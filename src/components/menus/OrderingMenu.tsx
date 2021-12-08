import classNames from "classnames";
import GenericMenu from "./Generic";

type OrderingMenuModel<T extends string = string> = {
  readonly order: Http.Order;
  readonly label: string;
  readonly id: T;
};

interface OrderingMenuProps<T extends string = string> extends StandardComponentProps {
  readonly models: OrderingMenuModel<T>[];
}

const OrderingMenu = <T extends string = string>({ models, ...props }: OrderingMenuProps<T>): JSX.Element => {
  return (
    <GenericMenu<OrderingMenuModel<T>>
      {...props}
      models={models}
      className={classNames("model-menu", props.className)}
    />
  );
};

export default OrderingMenu;
