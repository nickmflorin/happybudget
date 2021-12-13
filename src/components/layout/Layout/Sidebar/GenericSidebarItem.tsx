import React, { ReactNode, useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { isNil } from "lodash";
import classNames from "classnames";

import { ShowHide, TooltipWrapper, Separator } from "components";

const sidebarItemIsActive = <T extends ISidebarItem>(item: T, location: { pathname: string }): boolean => {
  if (!isNil(item.active)) {
    return item.active;
  }
  if (!isNil(item.activePathRegexes)) {
    for (let i = 0; i < item.activePathRegexes.length; i++) {
      if (location.pathname.match(item.activePathRegexes[i])) {
        return true;
      }
    }
  }
  if (!isNil(item.to) && location.pathname.startsWith(item.to)) {
    return true;
  }
  return false;
};

const GenericSidebarItem = <T extends ISidebarItem>(
  props: Omit<T, "children"> & StandardComponentProps & { readonly children?: ReactNode }
): JSX.Element => {
  const history = useHistory();
  const location = useLocation();

  const active = useMemo(
    () => sidebarItemIsActive(props, location),
    [props.active, location.pathname, props.to, props.activePathRegexes]
  );

  if (props.hidden === true) {
    return <></>;
  }
  return (
    <TooltipWrapper tooltip={props.tooltip}>
      <div style={props.style} className={classNames("sidebar-menu-item", { active }, props.className)}>
        <div
          className={"sidebar-menu-item-content"}
          onClick={() => {
            props.closeSidebarOnClick?.();
            if (!isNil(props.to)) {
              history.push(props.to);
            } else if (!isNil(props.onClick)) {
              props.onClick();
            }
          }}
        >
          <ShowHide show={!isNil(props.icon)}>
            <div className={"icon-container"}>{active && !isNil(props.activeIcon) ? props.activeIcon : props.icon}</div>
          </ShowHide>
          {props.children}
        </div>
        <ShowHide show={props.separatorAfter === true}>
          <Separator color={"#3f4252"} style={{ width: "80%" }} />
        </ShowHide>
      </div>
    </TooltipWrapper>
  );
};

export default React.memo(GenericSidebarItem) as typeof GenericSidebarItem;
