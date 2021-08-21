import React from "react";
import { useHistory } from "react-router-dom";
import classNames from "classnames";
import { isNil } from "lodash";

import { Checkbox } from "antd";
import { Spinner, VerticalFlexCenter, IconOrSpinner } from "components";

type MenuItemWithChildrenProps = StandardComponentWithChildrenProps & {
  readonly onClick?: (e: React.MouseEvent<HTMLLIElement>) => void;
  readonly visible?: boolean;
  readonly selected?: boolean;
  readonly defaultSelected?: boolean;
};

type MenuItemWithObjectsProps = IMenuItem & {
  readonly checkbox?: boolean;
  readonly selected?: boolean;
  readonly defaultSelected?: boolean;
};

export type MenuItemProps = MenuItemWithChildrenProps | MenuItemWithObjectsProps;

const isPropsWithChildren = (props: MenuItemProps): props is MenuItemWithChildrenProps =>
  (props as MenuItemWithChildrenProps).children !== undefined;

const MenuItemInner = (props: MenuItemWithObjectsProps): JSX.Element => {
  return (
    <React.Fragment>
      {props.checkbox && <Checkbox checked={props.selected} defaultChecked={props.defaultSelected} />}
      {!isNil(props.icon) && (
        <VerticalFlexCenter>
          <IconOrSpinner size={16} loading={props.loading} icon={props.icon} />
        </VerticalFlexCenter>
      )}
      {isNil(props.icon) && props.loading && (
        <VerticalFlexCenter>
          <Spinner size={16} />
        </VerticalFlexCenter>
      )}
      <VerticalFlexCenter style={{ overflowX: "hidden" }}>
        {!isNil(props.renderContent) ? props.renderContent() : <span className={"text-wrapper"}>{props.label}</span>}
      </VerticalFlexCenter>
    </React.Fragment>
  );
};

const MemoizedMenuItemInner = React.memo(MenuItemInner);

const MenuItem = (props: MenuItemProps): JSX.Element => {
  const history = useHistory();
  if (props.visible === false) {
    return <></>;
  }
  return (
    <li
      className={classNames("menu-item", { selected: props.selected }, props.className)}
      style={props.style}
      onClick={(e: React.MouseEvent<HTMLLIElement>) => {
        if (!isPropsWithChildren(props) && !isNil(props.url)) {
          history.push(props.url);
        }
        props.onClick?.(e);
      }}
      id={props.id}
    >
      {isPropsWithChildren(props) ? props.children : <MemoizedMenuItemInner {...props} />}
    </li>
  );
};

export default React.memo(MenuItem);
