import { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { isNil } from "lodash";
import classNames from "classnames";

import { ShowHide, TooltipWrapper, Separator } from "components";

export interface ISidebarItem {
  icon?: JSX.Element;
  activeIcon?: JSX.Element;
  text?: string;
  to?: string;
  collapsed?: boolean;
  active?: boolean;
  hidden?: boolean;
  separatorAfter?: boolean;
  activePathRegexes?: RegExp[];
  children?: ISidebarItem[];
  childrenLoading?: boolean;
  defaultShowChildren?: boolean;
  tooltip?: Tooltip;
  onClick?: () => void;
  onActivated?: () => void;
}

const SidebarItem = ({
  icon,
  activeIcon,
  text,
  to,
  active,
  hidden,
  separatorAfter,
  activePathRegexes,
  tooltip,
  collapsed = false,
  onClick,
  onActivated
}: ISidebarItem): JSX.Element => {
  const [isActive, setIsActive] = useState(false);
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    if (!isNil(active)) {
      setIsActive(active);
    } else if (!isNil(activePathRegexes)) {
      let setActive = false;
      for (let i = 0; i < activePathRegexes.length; i++) {
        if (location.pathname.match(activePathRegexes[i])) {
          setIsActive(true);
          setActive = true;
          break;
        }
      }
      if (!setActive) {
        setIsActive(false);
      }
    } else if (!isNil(to)) {
      if (location.pathname.startsWith(to)) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    } else {
      setIsActive(false);
    }
  }, [active, location.pathname, to, activePathRegexes]);

  useEffect(() => {
    if (isActive === true && !isNil(onActivated)) {
      onActivated();
    }
  }, [isActive, onActivated]);

  if (hidden === true) {
    return <></>;
  }
  return (
    <TooltipWrapper tooltip={tooltip}>
      <div className={classNames("sidebar-menu-item", { active: isActive })}>
        <div
          className={"sidebar-menu-item-item"}
          onClick={() => {
            if (!isNil(to)) {
              history.push(to);
            } else if (!isNil(onClick)) {
              onClick();
            }
          }}
        >
          <ShowHide show={!isNil(icon)}>
            <div className={"icon-container"}>{isActive && !isNil(activeIcon) ? activeIcon : icon}</div>
          </ShowHide>
          <ShowHide show={collapsed === false && !isNil(text)}>
            <span className={"text-container"}>{text}</span>
          </ShowHide>
        </div>
        <ShowHide show={separatorAfter === true}>
          <Separator color={"#3f4252"} style={{ width: "80%" }} />
        </ShowHide>
      </div>
    </TooltipWrapper>
  );
};

export default SidebarItem;
