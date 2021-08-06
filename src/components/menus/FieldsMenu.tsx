import React, { useState, useEffect, useMemo } from "react";
import { map, filter, includes, isNil } from "lodash";
import classNames from "classnames";

import { Menu, Checkbox } from "antd";

import { Button } from "components/buttons";
import "./FieldsMenu.scss";

export interface FieldMenuField extends Field {
  defaultChecked?: boolean;
}

export interface IFieldMenuButton {
  readonly text: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly onClick?: (state: FieldCheck[]) => void;
}

interface FieldsMenuItemProps {
  readonly field: Field;
  readonly checked: boolean;
  readonly onClick?: () => void;
  [key: string]: any;
}

const FieldsMenuItem = ({ field, checked, onClick, ...props }: FieldsMenuItemProps): JSX.Element => {
  return (
    <Menu.Item {...props} className={"fields-menu-menu-item"} onClick={onClick}>
      <Checkbox checked={checked} />
      <span className={"text-container"}>{field.label}</span>
    </Menu.Item>
  );
};

export interface FieldsMenuProps {
  readonly fields: FieldMenuField[];
  readonly buttons?: IFieldMenuButton[];
  readonly onChange?: (change: FieldCheck) => void;
  readonly selected?: string[];
}

const FieldsMenu = ({ fields, buttons, selected, onChange }: FieldsMenuProps): JSX.Element => {
  const [_selected, setSelected] = useState<string[]>([]);

  const value = useMemo(() => {
    return !isNil(selected) ? selected : _selected;
  }, [selected, _selected]);

  useEffect(() => {
    const defaultCheckedFields: FieldMenuField[] = filter(
      fields,
      (field: FieldMenuField) => field.defaultChecked !== false
    );
    const defaultCheckedFieldIds = map(defaultCheckedFields, (field: FieldMenuField) => field.id);
    setSelected(defaultCheckedFieldIds);
  }, [fields]);

  return (
    <div className={"fields-menu"}>
      <Menu className={"fields-menu-menu"}>
        {map(fields, (field: FieldMenuField, index: number) => {
          return (
            <FieldsMenuItem
              key={index}
              field={field}
              onClick={() => {
                const checked = includes(value, field.id);
                if (checked === false) {
                  setSelected([...value, field.id]);
                } else {
                  setSelected(filter(value, (id: string) => id !== field.id));
                }
                !isNil(onChange) && onChange({ id: field.id, checked: !checked });
              }}
              checked={includes(value, field.id)}
            />
          );
        })}
      </Menu>
      {!isNil(buttons) && (
        <div className={"btn-container"}>
          {map(buttons, (btn: IFieldMenuButton, index: number) => {
            return (
              <Button
                key={index}
                className={classNames("btn btn--field-menu", btn.className)}
                style={btn.style}
                onClick={() =>
                  !isNil(btn.onClick) &&
                  btn.onClick(
                    map(fields, (field: FieldMenuField) => ({ id: field.id, checked: includes(selected, field.id) }))
                  )
                }
              >
                {btn.text}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FieldsMenu;
