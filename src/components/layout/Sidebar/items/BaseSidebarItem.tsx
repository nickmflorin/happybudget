import React, { ReactNode, useMemo } from "react";

import classNames from "classnames";

import { config } from "application";
import { ui } from "lib";
import { TooltipWrapper } from "components/tooltips";
import { ShowHide } from "components/util";
import { Separator } from "deprecated/components/structural";

const BaseSidebarItem = <T extends ISidebarItem>(
  props: Omit<T, "children"> &
    StandardComponentProps & {
      readonly children?: ReactNode;
      readonly closeSidebarOnClick?: () => void;
    },
): JSX.Element => {
  const history = useHistory();
  const location = useLocation();

  const active = useMemo(
    () => ui.layout.sidebarItemIsActive(props, location),
    [props.active, location.pathname, props.to, props.activePathRegexes],
  );

  if (props.hidden === true) {
    return <></>;
  }
  return (
    <TooltipWrapper tooltip={props.tooltip}>
      <div
        style={props.style}
        className={classNames("sidebar-menu-item", { active }, props.className)}
      >
        <div
          className="sidebar-menu-item-content"
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
            <div className="icon-container">
              {active && !isNil(props.activeIcon) ? props.activeIcon : props.icon}
            </div>
          </ShowHide>
          {props.children}
          <ShowHide show={!isNil(props.tagText)}>
            <div className="sidebar-menu-item-tag-container">
              <div className="sidebar-menu-item-tag">{props.tagText}</div>
            </div>
          </ShowHide>
        </div>
        <ShowHide show={props.separatorAfter === true}>
          <Separator color="#3f4252" style={{ width: "80%" }} />
        </ShowHide>
      </div>
    </TooltipWrapper>
  );
};

export default React.memo(GenericSidebarItem) as typeof GenericSidebarItem;
