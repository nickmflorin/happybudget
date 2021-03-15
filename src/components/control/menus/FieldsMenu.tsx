import React, { useState } from "react";
import { map, filter, includes, isNil } from "lodash";
import classNames from "classnames";

import { Menu, Checkbox, Button } from "antd";

import "./FieldsMenu.scss";

export interface FieldMenuField extends Field {
  defaultChecked?: boolean;
}

export interface IFieldMenuButton {
  text: string;
  onClick?: (fields: Field[]) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface FieldsMenuItemProps {
  field: Field;
  onChange?: (fields: Field[]) => void;
  selected: Field[];
  setSelected: (fields: Field[]) => void;
  checked: boolean;
}

const FieldsMenuItem = ({ field, checked, selected, setSelected, onChange }: FieldsMenuItemProps): JSX.Element => {
  return (
    <Menu.Item
      className={"fields-menu-menu-item"}
      onClick={() => {
        if (checked === false) {
          setSelected([...selected, field]);
          if (!isNil(onChange)) {
            onChange([...selected, field]);
          }
        } else {
          setSelected(filter(selected, (fld: Field) => fld.id !== field.id));
          if (!isNil(onChange)) {
            onChange(filter(selected, (fld: Field) => fld.id !== field.id));
          }
        }
      }}
    >
      <Checkbox checked={checked} />
      <span className={"text-container"}>{field.label}</span>
    </Menu.Item>
  );
};

export interface FieldsMenuProps {
  fields: FieldMenuField[];
  buttons?: IFieldMenuButton[];
  onChange?: (fields: Field[]) => void;
}

const FieldsMenu = ({ fields, buttons, onChange }: FieldsMenuProps): JSX.Element => {
  const [selected, setSelected] = useState<Field[]>(
    filter(fields, (field: FieldMenuField) => field.defaultChecked !== false)
  );

  return (
    <div className={"fields-menu"}>
      <Menu className={"fields-menu-menu"}>
        {map(fields, (field: FieldMenuField, index: number) => {
          return (
            <FieldsMenuItem
              key={index}
              field={field}
              onChange={onChange}
              selected={selected}
              setSelected={setSelected}
              checked={includes(
                map(selected, (fld: Field) => fld.id),
                field.id
              )}
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
                onClick={() => !isNil(btn.onClick) && btn.onClick(selected)}
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
