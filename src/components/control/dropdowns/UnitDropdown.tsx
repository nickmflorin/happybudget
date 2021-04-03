import { useEffect, useState } from "react";
import { find, isNil } from "lodash";
import classNames from "classnames";
import { Dropdown } from "antd";

import { ModelTagsMenu } from "components/control/menus";
import { Tag } from "components/display";

interface UnitDropdownProps<
  I extends number,
  N extends string,
  M extends DistinctOptionModel<I, N> = DistinctOptionModel<I, N>
> {
  value: I | null;
  className?: string;
  trigger?: ("click" | "hover" | "contextMenu")[];
  onChange: (value: I) => void;
  models: M[];
}

const UnitDropdown = <
  I extends number,
  N extends string,
  M extends DistinctOptionModel<I, N> = DistinctOptionModel<I, N>
>({
  /* eslint-disable indent */
  value,
  models,
  className,
  onChange,
  trigger = ["click"]
}: UnitDropdownProps<I, N, M>): JSX.Element => {
  const [model, setModel] = useState<M | undefined>(undefined);
  useEffect(() => {
    if (!isNil(value)) {
      const _item: M | undefined = find(models, { id: value } as any);
      if (!isNil(_item)) {
        setModel(_item);
      } else {
        setModel(undefined);
      }
    } else {
      setModel(undefined);
    }
  }, [value]);

  return (
    <Dropdown
      className={classNames("units-dropdown", className)}
      trigger={trigger}
      overlay={<ModelTagsMenu<I, N, M> models={models} onChange={onChange} />}
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
