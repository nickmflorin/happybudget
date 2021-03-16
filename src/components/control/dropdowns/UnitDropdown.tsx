import { useEffect, useState } from "react";
import { find, isNil } from "lodash";
import classNames from "classnames";
import { Dropdown } from "antd";

import { UnitsMenu } from "components/control/menus";
import { UnitsMenuProps } from "components/control/menus/UnitsMenu";
import { Tag } from "components/display";
import { UnitModelsList } from "model";

interface UnitDropdownProps extends UnitsMenuProps {
  value: Unit | null;
  className?: string;
  trigger?: ("click" | "hover" | "contextMenu")[];
}

const UnitDropdown = ({ value, className, trigger = ["click"], ...props }: UnitDropdownProps): JSX.Element => {
  const [model, setModel] = useState<UnitModel | undefined>(undefined);
  useEffect(() => {
    if (!isNil(value)) {
      const _item = find(UnitModelsList, { id: value });
      setModel(_item);
    } else {
      setModel(undefined);
    }
  }, [value]);

  return (
    <Dropdown className={classNames("units-dropdown", className)} trigger={trigger} overlay={<UnitsMenu {...props} />}>
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

export default UnitDropdown;
