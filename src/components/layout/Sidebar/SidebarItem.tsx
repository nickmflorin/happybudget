import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { isNil, map } from "lodash";
import classNames from "classnames";

import { RenderOrSpinner } from "components/display";

export interface ISidebarItem {
  icon?: JSX.Element;
  text: string;
  to?: string;
  active?: boolean;
  hidden?: boolean;
  activePathRegexes?: RegExp[];
  children?: ISidebarItem[];
  childrenLoading?: boolean;
  defaultShowChildren?: boolean;
  onClick?: () => void;
  onActivated?: () => void;
  onChildrenExpanded?: () => void;
}

const SidebarItem = ({
  icon,
  text,
  to,
  active,
  hidden,
  activePathRegexes,
  children,
  defaultShowChildren = false,
  childrenLoading = false,
  onClick,
  onActivated,
  onChildrenExpanded
}: ISidebarItem): JSX.Element => {
  const [isActive, setIsActive] = useState(false);
  const [childrenVisible] = useState(defaultShowChildren);
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
        {!isNil(icon) && <div className={"icon-container"}>{icon}</div>}
        <span className={"text-container"}>{text}</span>
      </div>
      {!isNil(children) && childrenVisible && (
        <div className={"sidebar-menu nested"}>
          <RenderOrSpinner loading={childrenLoading} fontSize={16}>
            <React.Fragment>
              {map(children, (child: ISidebarItem, index: number) => (
                <SidebarItem key={index} {...child} />
              ))}
            </React.Fragment>
          </RenderOrSpinner>
        </div>
      )}
    </div>
  );
};

export default SidebarItem;
