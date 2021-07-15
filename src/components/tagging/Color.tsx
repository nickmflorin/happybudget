import React from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/pro-solid-svg-icons";
import { faCircle as faCircleOpen } from "@fortawesome/pro-light-svg-icons";

interface ColorProps extends StandardComponentProps {
  color?: string | null | undefined;
  selected?: boolean;
  noValueColor?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Color = ({ color, selected, className, noValueColor, onClick, style = {} }: ColorProps): JSX.Element => {
  return (
    <div
      className={classNames("color", className, { selected })}
      style={style}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => !isNil(onClick) && onClick(e)}
    >
      {!isNil(color) ? (
        <React.Fragment>
          <div className={"icon-border"}></div>
          <FontAwesomeIcon icon={faCircle} style={{ color }} />
        </React.Fragment>
      ) : (
        <FontAwesomeIcon icon={faCircleOpen} style={{ color: noValueColor || "#585858" }} />
      )}
    </div>
  );
};

export default Color;
