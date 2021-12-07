import React, { useMemo } from "react";
import classNames from "classnames";
import { chunk, map, includes } from "lodash";

import { Colors } from "style/constants";
import Color from "./Color";
import "./ColorGrid.scss";

interface ColorGridProps extends StandardComponentProps {
  readonly colors: string[];
  readonly value?: string | null;
  readonly onChange?: (value: string, e: React.MouseEvent<HTMLDivElement>) => void;
}

const COLORS_PER_ROW = 4;

const ColorGrid = ({ colors, value, onChange, ...props }: ColorGridProps): JSX.Element => {
  const cs = useMemo(() => {
    if (!includes(colors, Colors.COLOR_NO_COLOR)) {
      return [Colors.COLOR_NO_COLOR, ...colors];
    }
    return colors;
  }, [colors]);

  const colorGroups = useMemo(() => chunk(cs, Math.ceil(cs.length / COLORS_PER_ROW)), [cs]);

  return (
    <div {...props} className={classNames("color-grid", props.className)}>
      {map(colorGroups, (group: string[], i: number) => (
        <div className={"color-row"} key={i}>
          {map(group, (c: string, j: number) => (
            <Color
              key={j}
              color={c}
              selected={value === c || (value === null && c === Colors.COLOR_NO_COLOR)}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => onChange?.(c, e)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default React.memo(ColorGrid);
