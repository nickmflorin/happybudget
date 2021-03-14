import React from "react";
import { isNil, map } from "lodash";
import classNames from "classnames";
import "./ActionsMenuBar.scss";

interface ActionsMenuBarProps {
  className?: string;
  style?: React.CSSProperties;
  children: JSX.Element[];
  expand?: number;
}

const ActionsMenuBar = ({ children, className, style = {}, expand }: ActionsMenuBarProps): JSX.Element => {
  return (
    <div className={classNames("actions-menu-bar", className)} style={style}>
      {map(children, (child: JSX.Element, index: number) => {
        return (
          <div
            className={classNames("actions-menu-bar-item", { expand: !isNil(expand) && expand === index })}
            key={index}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

export default ActionsMenuBar;
