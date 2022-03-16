import React, { useMemo, useState } from "react";
import classNames from "classnames";
import { chunk, map, includes } from "lodash";

import { RenderOrSpinner } from "components/loading";
import { Colors } from "style/constants";
import Color from "./Color";

export type ColorGridProps = StandardComponentProps & {
  readonly colors: string[];
  readonly value?: string | null;
  readonly loading?: boolean;
  readonly wrapped?: boolean;
  readonly useDefault?: boolean | string;
  readonly colorsPerRow?: number;
  readonly colorClassName?: string;
  readonly colorStyle?: React.CSSProperties;
  /* Whether or not selecting the default color should be treated as a null
     selection.  Defaults to false. */
  readonly treatDefaultAsNull?: boolean;
  readonly selectable?: boolean;
  readonly colorSize?: number;
  readonly onChange?: (value: string | null, e: React.MouseEvent<HTMLDivElement>) => void;
};

const ColorGrid = ({
  colors,
  value,
  loading,
  useDefault,
  colorsPerRow = 4,
  treatDefaultAsNull,
  colorSize = 16,
  selectable,
  colorStyle,
  colorClassName,
  wrapped,
  onChange,
  ...props
}: ColorGridProps): JSX.Element => {
  const [_value, setValue] = useState<string | null>(null);

  const vl = useMemo(() => (value !== undefined ? value : _value), [_value, value]);

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

  const _onChange = useMemo(
    () => (c: string, e: React.MouseEvent<HTMLDivElement>) => {
      let v: string | null = c;
      if (defaultUsed === true && treatDefaultAsNull === true && c === defaultColor) {
        v = null;
      }
      onChange?.(v, e);
      setValue(v);
    },
    [onChange, defaultUsed, treatDefaultAsNull, defaultColor]
  );

  const colorGroups = useMemo(() => chunk(cs, Math.ceil(cs.length / colorsPerRow)), [cs]);

  const renderColor = useMemo(
    () => (c: string, i: number) =>
      (
        <Color
          key={i}
          color={c}
          size={colorSize}
          className={classNames("color-grid-color", colorClassName)}
          style={{ maxWidth: `${colorSize}px`, ...colorStyle }}
          useDefault={false}
          selected={vl === c || (vl === null && c === Colors.COLOR_NO_COLOR)}
          selectable={selectable}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => _onChange(c, e)}
        />
      ),
    [colorSize, colorClassName, colorStyle, selectable, vl, _onChange]
  );

  return (
    <RenderOrSpinner loading={loading}>
      <div {...props} className={classNames("color-grid", props.className, { wrapped })}>
        {wrapped ? (
          <React.Fragment>{map(cs, (c: string, i: number) => renderColor(c, i))}</React.Fragment>
        ) : (
          <React.Fragment>
            {map(colorGroups, (group: string[], i: number) => (
              <div className={"color-row"} key={i}>
                {map(group, (c: string, j: number) => renderColor(c, j))}
              </div>
            ))}
          </React.Fragment>
        )}
      </div>
    </RenderOrSpinner>
  );
};

export default React.memo(ColorGrid);
