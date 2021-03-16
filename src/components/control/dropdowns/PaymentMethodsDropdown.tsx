import { useEffect, useState } from "react";
import { find, isNil } from "lodash";
import classNames from "classnames";
import { Dropdown } from "antd";

import { ModelTagsMenu } from "components/control/menus";
import { Tag } from "components/display";
import { PaymentMethodModelsList } from "model";

interface PaymentMethodsDropdownProps {
  value: PaymentMethod | null;
  className?: string;
  trigger?: ("click" | "hover" | "contextMenu")[];
  onChange: (value: PaymentMethod) => void;
}

const PaymentMethodsDropdown = ({
  value,
  className,
  onChange,
  trigger = ["click"]
}: PaymentMethodsDropdownProps): JSX.Element => {
  const [model, setModel] = useState<PaymentMethodModel | undefined>(undefined);
  useEffect(() => {
    if (!isNil(value)) {
      const _item = find(PaymentMethodModelsList, { id: value });
      setModel(_item);
    } else {
      setModel(undefined);
    }
  }, [value]);

  return (
    <Dropdown
      className={classNames("units-dropdown", className)}
      trigger={trigger}
      overlay={<ModelTagsMenu<PaymentMethod, PaymentMethodName> models={PaymentMethodModelsList} onChange={onChange} />}
    >
      <div className={"unit-dropdown-child"}>
        {!isNil(model) ? (
          <Tag colorIndex={model.id} uppercase>
            {model.name}
          </Tag>
        ) : (
          <Tag uppercase color={"#c1c1c1"}>
            {"None"}
          </Tag>
        )}
      </div>
    </Dropdown>
  );
};

export default PaymentMethodsDropdown;
