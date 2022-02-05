import React from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { ColorIcon, ColorIconProps } from "components/icons";

interface ColorProps extends StandardComponentProps, ColorIconProps {
  readonly onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Color = ({ style, className, onClick, ...props }: ColorProps): JSX.Element => {
  return (
    <div
      className={classNames("color", className)}
      style={style}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => !isNil(onClick) && onClick(e)}
    >
      <ColorIcon {...props} />
    </div>
  );
};

export default React.memo(Color);
