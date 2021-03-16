import { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";
import { selectConsistent } from "util/arrays";

import "./Tag.scss";

export const DEFAULT_TAG_COLOR_SCHEME = [
  "#797695",
  "#ff7165",
  "#80cbc4",
  "#ce93d8",
  "#fed835",
  "#c87987",
  "#69f0ae",
  "#a1887f",
  "#81d4fa",
  "#f75776",
  "#66bb6a",
  "#58add6"
];

interface TagProps {
  children: string;
  color?: string;
  scheme?: string[];
  uppercase?: boolean;
  colorIndex?: number;
}

const Tag = ({ children, scheme, uppercase, color, colorIndex }: TagProps): JSX.Element => {
  const tagColor = useMemo(() => {
    if (!isNil(color)) {
      return color;
    }
    let tagColorScheme = DEFAULT_TAG_COLOR_SCHEME;
    if (!isNil(scheme)) {
      tagColorScheme = scheme;
    }
    if (!isNil(colorIndex) && !isNil(tagColorScheme[colorIndex])) {
      return tagColorScheme[colorIndex];
    }
    return selectConsistent(tagColorScheme, children);
  }, [children, color]);

  return (
    <div className={classNames("tag", { uppercase })} style={{ backgroundColor: tagColor }}>
      {children}
    </div>
  );
};

export default Tag;
