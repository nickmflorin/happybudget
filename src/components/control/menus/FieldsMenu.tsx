import React, { useState } from "react";
import { map, filter, includes, isNil } from "lodash";
import classNames from "classnames";

import { Menu, Checkbox, Button } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import "./FieldsMenu.scss";

export interface IFieldMenuButton {
  text: string;
  onClick?: (fields: IFieldMenuField[]) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface FieldsMenuProps {
  fields: IFieldMenuField[];
  buttons?: IFieldMenuButton[];
  onChange?: (fields: IFieldMenuField[]) => void;
}

const FieldsMenu = ({ fields, buttons, onChange }: FieldsMenuProps): JSX.Element => {
  const [selected, setSelected] = useState<IFieldMenuField[]>(
    filter(fields, (field: IFieldMenuField) => field.defaultChecked !== false)
  );

  return (
    <div className={"field-menu"}>
      <Menu className={"field-menu-menu"}>
        {map(fields, (field: IFieldMenuField, index: number) => {
          return (
            <Menu.Item key={index} className={"field-menu-menu-item"}>
              <Checkbox
                onChange={(e: CheckboxChangeEvent) => {
                  if (e.target.checked) {
                    setSelected([...selected, field]);
                    if (!isNil(onChange)) {
                      onChange([...selected, field]);
                    }
                  } else {
                    setSelected(filter(selected, (fld: IFieldMenuField) => fld.id !== field.id));
                    if (!isNil(onChange)) {
                      onChange(filter(selected, (fld: IFieldMenuField) => fld.id !== field.id));
                    }
                  }
                }}
                checked={includes(
                  map(selected, (fld: IFieldMenuField) => fld.id),
                  field.id
                )}
              />
              <span className={"text-container"}>{field.label}</span>
            </Menu.Item>
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
