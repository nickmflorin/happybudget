import React from "react";
import { useHistory } from "react-router-dom";
import classNames from "classnames";
import { isNil } from "lodash";

import { Checkbox } from "antd";

import { IconOrSpinner, VerticalFlexCenter, Spinner } from "components";

import { model } from "lib";
import MenuItems from "./MenuItems";

const PrivateCommonMenuItem = <M extends MenuItemModel>(
  props: ICommonMenuItem<M> & { readonly isExtra: boolean; readonly children: JSX.Element }
): JSX.Element => {
  const history = useHistory();

  if (props.model.visible === false) {
    return <></>;
  }
  return (
    <li
      id={`${props.menuId}-item-${props.model.id}`}
      className={classNames(
        "menu-item",
        {
          disabled: props.model.disabled,
          focused: props.focused,
          "menu-item--extra": props.isExtra
        },
        props.className
      )}
      style={props.style}
      onClick={(e: React.MouseEvent<HTMLLIElement>) => {
        if (!isNil(props.model.url)) {
          history.push(props.model.url);
        }
        props.onClick?.({ event: e, model: props.model });
      }}
    >
      {props.children}
    </li>
  );
};

const CommonMenuItem = React.memo(PrivateCommonMenuItem) as typeof PrivateCommonMenuItem;

export const ExtraMenuItem = (props: IExtraMenuItem): JSX.Element => {
  if (props.model.visible === false) {
    return <></>;
  }
  return (
    <CommonMenuItem {...props} isExtra={true}>
      <React.Fragment>
        {!isNil(props.model.icon) && (
          <VerticalFlexCenter>
            <IconOrSpinner size={16} loading={props.model.loading} icon={props.model.icon} />
          </VerticalFlexCenter>
        )}
        {isNil(props.model.icon) && props.model.loading && (
          <VerticalFlexCenter>
            <Spinner size={16} />
          </VerticalFlexCenter>
        )}
        <VerticalFlexCenter>
          <span className={"text-wrapper"}>{props.model.label}</span>
        </VerticalFlexCenter>
      </React.Fragment>
    </CommonMenuItem>
  );
};

const PrivateMenuItem = <M extends MenuItemModel>(props: IMenuItem<M>): JSX.Element => {
  if (props.model.visible === false) {
    return <></>;
  }
  return (
    <CommonMenuItem
      {...props}
      isExtra={false}
      className={classNames({ focused: props.focused }, props.className)}
      style={{
        ...props.style,
        ...(!isNil(props.levelIndent) && !isNil(props.level)
          ? { paddingLeft: 10 + props.levelIndent * props.level }
          : { paddingLeft: 10 }),
        borderTop: props.level === 0 && props.bordersForLevels === true ? "1px solid #EFEFEF" : "none",
        paddingTop: props.level === 0 ? 4 : 2,
        paddingBottom: props.level === 0 ? 4 : 2,
        height: props.level === 0 ? "32px" : "28px"
      }}
    >
      <React.Fragment>
        {props.checkbox && <Checkbox checked={props.selected} />}
        {!isNil(props.model.icon) && (
          <VerticalFlexCenter>
            <IconOrSpinner size={16} loading={props.model.loading} icon={props.model.icon} />
          </VerticalFlexCenter>
        )}
        {isNil(props.model.icon) && props.model.loading && (
          <VerticalFlexCenter>
            <Spinner size={16} />
          </VerticalFlexCenter>
        )}
        <VerticalFlexCenter style={{ overflowX: "hidden" }}>
          {!isNil(props.renderContent) ? (
            props.renderContent(props.model, { level: props.level })
          ) : (
            <span className={"text-wrapper"}>{props.model.label}</span>
          )}
        </VerticalFlexCenter>
      </React.Fragment>
    </CommonMenuItem>
  );
};

export const MenuItem = React.memo(PrivateMenuItem) as typeof PrivateMenuItem;

const PrivateRecursiveMenuItem = <M extends MenuItemModel>(
  props: IMenuItem<M> & { readonly recursion?: IMenuItems<M> }
): JSX.Element => {
  return (
    <React.Fragment>
      <MenuItem {...props} />
      {model.typeguards.isModelWithChildren(props.model) &&
        /* eslint-disable indent */
        props.model.children.length !== 0 &&
        !isNil(props.recursion) && (
          <MenuItems<M> {...props.recursion} models={props.model.children} level={props.level + 1} />
        )}
    </React.Fragment>
  );
};

export const RecursiveMenuItem = React.memo(PrivateRecursiveMenuItem) as typeof PrivateRecursiveMenuItem;
