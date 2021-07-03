import React, { useState } from "react";
import { map, filter, includes, isNil } from "lodash";
import classNames from "classnames";

import { Menu, Checkbox, Button } from "antd";

import "./FieldsMenu.scss";
import { useEffect } from "react";

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
  fields: FieldMenuField[];
  buttons?: IFieldMenuButton[];
  onChange?: (change: FieldCheck) => void;
}

const FieldsMenu = ({ fields, buttons, onChange }: FieldsMenuProps): JSX.Element => {
  const [selected, setSelected] = useState<string[]>([]);

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
                const checked = includes(selected, field.id);
                if (checked === false) {
                  setSelected([...selected, field.id]);
                } else {
                  setSelected(filter(selected, (id: string) => id !== field.id));
                }
                !isNil(onChange) && onChange({ id: field.id, checked: !checked });
              }}
              checked={includes(selected, field.id)}
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
                className={classNames("btn--field-menu", btn.className)}
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
