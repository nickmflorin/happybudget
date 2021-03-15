import { useEffect, useState } from "react";
import { find, isNil } from "lodash";
import classNames from "classnames";
import { Dropdown } from "antd";

import { UnitsMenu } from "components/control/menus";
import { UnitsMenuProps, UNIT_MENU_ITEMS, IUnitMenuItem, UnitTag } from "components/control/menus/UnitsMenu";

interface UnitDropdownProps extends UnitsMenuProps {
  value: Unit | null;
  className?: string;
  trigger?: ("click" | "hover" | "contextMenu")[];
}

const UnitDropdown = ({ value, className, trigger = ["click"], ...props }: UnitDropdownProps): JSX.Element => {
  const [item, setItem] = useState<IUnitMenuItem | undefined>(undefined);
  useEffect(() => {
    if (!isNil(value)) {
      const _item = find(UNIT_MENU_ITEMS, { value }) as IUnitMenuItem;
      setItem(_item);
    } else {
      setItem({
        value: null,
        label: "None",
        color: "#a9a9a9"
      });
    }
  }, [value]);

  return (
    <Dropdown className={classNames("units-dropdown", className)} trigger={trigger} overlay={<UnitsMenu {...props} />}>
      <div className={"unit-dropdown-child"}>{!isNil(item) && <UnitTag item={item} />}</div>
    </Dropdown>
  );
};

export default UnitDropdown;
