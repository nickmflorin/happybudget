import React, { useState } from "react";
import { isNil, map } from "lodash";
import classNames from "classnames";

import { RenderOrSpinner, Color } from "components";

import "./ColorSelect.scss";

interface ColorSelectProps extends StandardComponentProps {
  colors: string[];
  value?: string | null;
  itemClassName?: string;
  itemStyle?: React.CSSProperties;
  loading?: boolean;
  onChange?: (value: string) => void;
}

const ColorSelect: React.FC<ColorSelectProps> = ({
  className,
  itemClassName,
  itemStyle = {},
  style = {},
  colors,
  value,
  loading,
  onChange
}) => {
  const [color, setColor] = useState<string>(colors[0]);
  return (
    <RenderOrSpinner loading={loading}>
      <div className={classNames("color-select", className)} style={style}>
        {map(colors, (c: string) => {
          return (
            <Color
              color={c || color}
              selected={!isNil(value) ? value === c : color === c}
              className={classNames("color-select-color", itemClassName)}
              style={itemStyle}
              onClick={() => {
                setColor(c);
                onChange?.(c);
              }}
            />
          );
        })}
      </div>
    </RenderOrSpinner>
  );
};

export default ColorSelect;
