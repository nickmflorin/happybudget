import { useMemo } from "react";
import { find, isNil } from "lodash";
import classNames from "classnames";
import { Dropdown } from "antd";

import { ModelTagsMenu } from "components/control/menus";
import { Tag } from "components/display";
import { getKeyValue } from "util/objects";

interface ModelTagsDropdownProps<M extends Model, V extends number = number> {
  value: V | null;
  className?: string;
  trigger?: ("click" | "hover" | "contextMenu")[];
  onChange: (value: M) => void;
  labelField: keyof M;
  models: M[];
}

const ModelTagsDropdown = <M extends Model, V extends number = number>({
  /* eslint-disable indent */
  value,
  models,
  className,
  labelField,
  onChange,
  trigger = ["click"]
}: ModelTagsDropdownProps<M, V>): JSX.Element => {
  const model = useMemo((): M | null => {
    if (!isNil(value)) {
      const m = find(models, { id: value } as any);
      if (!isNil(m)) {
        return m;
      }
      return null;
    }
    return null;
  }, [value]);

  const label = useMemo((): string | null => {
    if (!isNil(model)) {
      const modelValue = getKeyValue<M, keyof M>(labelField)(model);
      if (typeof modelValue === "string") {
        return modelValue;
      }
      return null;
    }
    return null;
  }, [model]);

  return (
    <Dropdown
      className={classNames("model-tags-dropdown", className)}
      trigger={trigger}
      overlay={<ModelTagsMenu<M> models={models} labelField={labelField} onChange={onChange} />}
    >
      <div className={"model-tags-dropdown-child"}>
        {!isNil(model) && !isNil(label) ? (
          <Tag colorIndex={model.id} uppercase>
            {label}
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

export default ModelTagsDropdown;
