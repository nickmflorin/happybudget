import React from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { ColorIcon, ColorIconProps } from "components/icons";

export type ColorProps = StandardComponentProps &
  ColorIconProps & {
    readonly onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  };

const Color = ({ onClick, id, className, style, ...props }: ColorProps): JSX.Element => (
  <div
    id={id}
    className={classNames("color", className)}
    style={{ ...style, width: `${props.size}px`, height: `${props.size}px` }}
    onClick={(e: React.MouseEvent<HTMLDivElement>) => !isNil(onClick) && onClick(e)}
  >
    <ColorIcon {...props} />
  </div>
);

export default React.memo(Color);
