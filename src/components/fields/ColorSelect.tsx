import React, { useState } from "react";
import { isNil, map } from "lodash";
import classNames from "classnames";

import { RenderOrSpinner } from "components";
import { Color } from "components/tagging";

import "./ColorSelect.scss";

interface ColorSelectProps extends StandardComponentProps {
  colors: string[];
  value?: string | null;
  itemClassName?: string;
  itemStyle?: React.CSSProperties;
  loading?: boolean;
  onChange?: (value: string, e: React.MouseEvent<HTMLDivElement>) => void;
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
        {map(colors, (c: string, index: number) => {
          return (
            <Color
              key={index}
              color={c || color}
              selected={!isNil(value) ? value === c : color === c}
              className={classNames("color-select-color", itemClassName)}
              style={itemStyle}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                setColor(c);
                onChange?.(c, e);
              }}
            />
          );
        })}
      </div>
    </RenderOrSpinner>
  );
};

export default React.memo(ColorSelect);
