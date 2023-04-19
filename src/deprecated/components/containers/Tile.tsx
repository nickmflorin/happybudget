import React from "react";

import classNames from "classnames";
import { isNil } from "lodash";

interface TileProps extends StandardComponentWithChildrenProps {
  readonly title?: string;
  readonly subTitle?: string;
  readonly contentProps?: StandardComponentProps;
}

const Tile = ({ children, title, subTitle, contentProps, ...props }: TileProps) => (
  <div {...props} className={classNames("tile", props.className)}>
    {!isNil(title) && <div className="title">{title}</div>}
    {!isNil(subTitle) && <div className="sub-title">{subTitle}</div>}
    <div {...contentProps} className={classNames("tile-content", contentProps?.className)}>
      {children}
    </div>
  </div>
);

export default React.memo(Tile);
