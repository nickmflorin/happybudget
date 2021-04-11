import React, { useState } from "react";
import { isNil, map } from "lodash";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

import "./ColorSelect.scss";

interface ColorSelectItemProps extends StandardComponentProps {
  color: string;
  selected: boolean;
  onClick: () => void;
}

const ColorSelectItem: React.FC<ColorSelectItemProps> = ({ color, selected, onClick, style = {}, className }) => {
  return (
    <div className={classNames("color-select-item", className, { selected })} style={style} onClick={() => onClick()}>
      <div className={"icon-border"}></div>
      <FontAwesomeIcon icon={faCircle} style={{ color }} />
    </div>
  );
};

interface ColorSelectProps extends StandardComponentProps {
  colors: string[];
  value?: string;
  itemClassName?: string;
  itemStyle?: React.CSSProperties;
  onChange?: (value: string) => void;
}

const ColorSelect: React.FC<ColorSelectProps> = ({
  className,
  itemClassName,
  itemStyle = {},
  style = {},
  colors,
  value,
  onChange
}) => {
  const [color, setColor] = useState<string>(colors[0]);
  return (
    <div className={classNames("color-select", className)} style={style}>
      {map(colors, (c: string) => {
        return (
          <ColorSelectItem
            color={c || color}
            selected={!isNil(value) ? value === c : color === c}
            className={itemClassName}
            style={itemStyle}
            onClick={() => {
              setColor(c);
              onChange?.(c);
            }}
          />
        );
      })}
    </div>
  );
};

export default ColorSelect;
