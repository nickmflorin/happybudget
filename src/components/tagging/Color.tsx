import React from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { Icon } from "components";
import { Colors } from "style/constants";

interface ColorProps extends StandardComponentProps {
  readonly color?: string | null | undefined;
  readonly selected?: boolean;
  readonly noValueColor?: string;
  readonly onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Color = ({ color, selected, className, noValueColor, onClick, style = {} }: ColorProps): JSX.Element => {
  return (
    <div
      className={classNames("color", className, { selectable: !isNil(selected), selected })}
      style={style}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => !isNil(onClick) && onClick(e)}
    >
      {!isNil(selected) ? (
        !isNil(color) ? (
          <React.Fragment>
            <div className={"icon-border"}></div>
            <Icon icon={"circle"} weight={"solid"} style={{ color }} />
          </React.Fragment>
        ) : (
          <Icon icon={"circle"} weight={"light"} style={{ color: noValueColor || Colors.COLOR_NO_COLOR }} />
        )
      ) : (
        <Icon icon={"circle"} weight={"solid"} style={{ color: color || Colors.COLOR_NO_COLOR }} />
      )}
    </div>
  );
};

export default React.memo(Color);
