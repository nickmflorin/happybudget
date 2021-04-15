import { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";
import { DEFAULT_TAG_COLOR_SCHEME } from "config";
import { selectConsistent } from "lib/util";

import "./Tag.scss";

interface TagProps extends StandardComponentProps {
  children: string;
  color?: string;
  scheme?: string[];
  uppercase?: boolean;
  colorIndex?: number;
}

const Tag = ({ children, scheme, uppercase, color, colorIndex, className, style = {} }: TagProps): JSX.Element => {
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

  const textColor = useMemo(() => {
    const r = parseInt(tagColor.substring(1, 3), 16) * 0.299;
    const g = parseInt(tagColor.substring(3, 5), 16) * 0.587;
    const b = parseInt(tagColor.substring(5, 7), 16) * 0.114;
    return r + g + b < 200 ? "white" : "black";
  }, [tagColor]);

  return (
    <div
      className={classNames("tag", { uppercase }, className)}
      style={{ ...style, backgroundColor: tagColor, color: textColor }}
    >
      {children}
    </div>
  );
};

export default Tag;
