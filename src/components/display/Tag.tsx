import { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";
import { DEFAULT_TAG_COLOR_SCHEME } from "config";
import { selectConsistent } from "util/arrays";

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

  return (
    <div className={classNames("tag", { uppercase }, className)} style={{ ...style, backgroundColor: tagColor }}>
      {children}
    </div>
  );
};

export default Tag;
