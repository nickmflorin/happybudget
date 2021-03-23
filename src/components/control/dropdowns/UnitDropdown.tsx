import { useEffect, useState } from "react";
import { find, isNil } from "lodash";
import classNames from "classnames";
import { Dropdown } from "antd";

import { ModelTagsMenu } from "components/control/menus";
import { Tag } from "components/display";
import { UnitModelsList } from "model";

interface UnitDropdownProps {
  value: Unit | null;
  className?: string;
  trigger?: ("click" | "hover" | "contextMenu")[];
  onChange: (value: Unit) => void;
}

const UnitDropdown = ({ value, className, onChange, trigger = ["click"] }: UnitDropdownProps): JSX.Element => {
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
    <Dropdown
      className={classNames("units-dropdown", className)}
      trigger={trigger}
      overlay={<ModelTagsMenu<Unit, UnitName> models={UnitModelsList} onChange={onChange} />}
    >
      <div className={"unit-dropdown-child"}>
        {!isNil(model) ? (
          <Tag colorIndex={model.id} uppercase>
            {model.name}
          </Tag>
        ) : (
          <Tag uppercase style={{ opacity: 0 }}>
            {"None"}
          </Tag>
        )}
      </div>
    </Dropdown>
  );
};

export default UnitDropdown;
