import { useMemo } from "react";
import { isNil } from "lodash";

import { Colors } from "style/constants";

export type ColorIconProps = {
  readonly color?: string | null | undefined;
  readonly size?: number;
  readonly selected?: boolean;
  readonly selectable?: boolean;
  readonly selectedColor?: Style.HexColor;
  readonly useDefault?: string | boolean;
};

const ColorIcon = ({
  color,
  useDefault,
  selectedColor = "#6eb6ff",
  selectable,
  selected,
  size = 16
}: ColorIconProps) => {
  const c = useMemo(() => {
    if (isNil(color) && (useDefault === true || typeof useDefault === "string")) {
      return typeof useDefault === "string" ? useDefault : Colors.COLOR_NO_COLOR;
    }
    return color;
  }, [color, useDefault]);
  if (!isNil(c)) {
    return (
      <svg width={size} height={size}>
        {(selectable || selected !== undefined) && (
          <rect
            height={size}
            width={size}
            fill={selected ? selectedColor : "transparent"}
            rx={size / 2}
            ry={size / 2}
          />
        )}
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 1} fill={c} />
      </svg>
    );
  }
  return <></>;
};

export default ColorIcon;
