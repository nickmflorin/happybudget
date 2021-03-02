import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { isNil, map } from "lodash";
import classNames from "classnames";

import { CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons";

import { ShowHide, RenderOrSpinner } from "components/display";

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

interface SidebarItemProps extends ISidebarItem {
  siblingWithCaret?: boolean;
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
  onChildrenExpanded,
  siblingWithCaret = false
}: SidebarItemProps): JSX.Element => {
  const [isActive, setIsActive] = useState(false);
  const [childrenVisible, setChildrenVisible] = useState(defaultShowChildren);
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
    <div
      className={classNames("sidebar-menu-item", {
        active: isActive,
        "no-caret": isNil(children) && siblingWithCaret === true
      })}
    >
      <div className={"sidebar-menu-item-item"}>
        {!isNil(children) && (
          <div
            className={"caret-container"}
            onClick={() => {
              if (!childrenVisible && !isNil(onChildrenExpanded)) {
                onChildrenExpanded();
              }
              setChildrenVisible(!childrenVisible);
            }}
          >
            <ShowHide show={childrenVisible}>
              <CaretDownOutlined className={"icon"} />
            </ShowHide>
            <ShowHide show={!childrenVisible}>
              <CaretRightOutlined className={"icon"} />
            </ShowHide>
          </div>
        )}
        <div
          className={"sidebar-menu-item-title"}
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
