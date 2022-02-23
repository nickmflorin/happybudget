import React, { useMemo } from "react";
import classNames from "classnames";
import { chunk, map, includes } from "lodash";

import { Colors } from "style/constants";
import Color from "./Color";

interface ColorGridProps extends StandardComponentProps {
  readonly colors: string[];
  readonly value?: string | null;
  readonly useDefault?: boolean | string;
  readonly colorsPerRow?: number;
  /* Whether or not selecting the default color should be treated as a null
     selection.  Defaults to false. */
  readonly treatDefaultAsNull?: boolean;
  readonly selectable?: boolean;
  readonly colorSize: number;
  readonly onChange?: (value: string | null, e: React.MouseEvent<HTMLDivElement>) => void;
}

const ColorGrid = ({
  colors,
  value,
  useDefault,
  colorsPerRow = 4,
  treatDefaultAsNull,
  colorSize,
  selectable,
  onChange,
  ...props
}: ColorGridProps): JSX.Element => {
  const defaultColor = useMemo(() => {
    return typeof useDefault === "string" ? useDefault : Colors.COLOR_NO_COLOR;
  }, [useDefault]);

  const [cs, defaultUsed] = useMemo(() => {
    /* We have to configure the color accounting for a potential default here
       instead of in the Color component (and we cannot pass in useDefault to
       the Color component) because we have to make sure that the useDefault
       color is not already in the grid. */
    if ((useDefault === true || typeof useDefault === "string") && !includes(colors, defaultColor)) {
      return [[defaultColor, ...colors], true];
    }
    return [colors, false];
  }, [colors, useDefault]);

  const colorGroups = useMemo(() => chunk(cs, Math.ceil(cs.length / colorsPerRow)), [cs]);

  return (
    <div {...props} className={classNames("color-grid", props.className)}>
      {map(colorGroups, (group: string[], i: number) => (
        <div className={"color-row"} key={i}>
          {map(group, (c: string, j: number) => (
            <Color
              key={j}
              color={c}
              size={colorSize}
              style={{ maxWidth: `${colorSize}px` }}
              useDefault={false}
              selected={value === c || (value === null && c === Colors.COLOR_NO_COLOR)}
              selectable={selectable}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                if (defaultUsed === true && treatDefaultAsNull === true && c === defaultColor) {
                  onChange?.(null, e);
                } else {
                  onChange?.(c, e);
                }
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default React.memo(ColorGrid);
