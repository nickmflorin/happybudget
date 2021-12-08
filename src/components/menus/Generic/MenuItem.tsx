import React, { useMemo } from "react";
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
          disabled: props.model.disabled || props.model.loading,
          focused: props.focused,
          "menu-item--extra": props.isExtra
        },
        props.className
      )}
      style={props.style}
      onClick={(e: React.MouseEvent<HTMLLIElement>) => {
        if (props.model.disabled !== true && props.model.loading !== true) {
          if (!isNil(props.model.url)) {
            history.push(props.model.url);
          }
          props.onClick?.({ event: e, model: props.model, closeParentDropdown: props.closeParentDropdown });
          if (props.model.keepDropdownOpenOnClick !== true && props.keepDropdownOpenOnClick !== true) {
            props.closeParentDropdown?.();
          }
        }
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
    <CommonMenuItem {...props} onClick={props.model.onClick} isExtra={true}>
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

const PrivateMenuItem = <M extends MenuItemModel>(props: IMenuItem<M> & { readonly label?: string }): JSX.Element => {
  const m = useMemo(() => {
    if (!isNil(props.label)) {
      return { ...props.model, label: props.label };
    } else if (!isNil(props.getLabel)) {
      return { ...props.model, label: props.getLabel(props.model) };
    } else {
      return props.model;
    }
  }, [props.model, props.label, props.getLabel]);

  if (props.model.visible === false) {
    return <></>;
  }

  return (
    <CommonMenuItem
      {...props}
      isExtra={false}
      style={{
        ...props.style,
        ...(!isNil(props.level) ? { paddingLeft: 10 + 6 * props.level } : { paddingLeft: 10 }),
        paddingTop: props.level === 0 ? 4 : 2,
        paddingBottom: props.level === 0 ? 4 : 2,
        height: props.level === 0 ? "32px" : "28px"
      }}
    >
      <React.Fragment>
        {props.checkbox && <Checkbox checked={props.selected} />}
        {!isNil(m.icon) && (
          <VerticalFlexCenter>
            <IconOrSpinner size={16} loading={m.loading} icon={m.icon} />
          </VerticalFlexCenter>
        )}
        {isNil(m.icon) && m.loading && (
          <VerticalFlexCenter>
            <Spinner size={16} />
          </VerticalFlexCenter>
        )}
        <VerticalFlexCenter>
          {!isNil(props.renderContent) ? (
            props.renderContent(m, { level: props.level })
          ) : !isNil(m.render) ? (
            m.render()
          ) : (
            <span className={"text-wrapper"}>{m.label}</span>
          )}
        </VerticalFlexCenter>
      </React.Fragment>
    </CommonMenuItem>
  );
};

export const MenuItem = React.memo(PrivateMenuItem) as typeof PrivateMenuItem;

const PrivateRecursiveMenuItem = <M extends MenuItemModel>(
  props: IMenuItem<M> & {
    readonly recursion?: IMenuItems<M>;
    readonly label?: string;
    readonly getLabel?: (m: M) => string;
  }
): JSX.Element => {
  return (
    <React.Fragment>
      <MenuItem {...props} id={`menu-${props.menuId}-item-${props.model.id}`} />
      {model.typeguards.isModelWithChildren(props.model) &&
        /* eslint-disable indent */
        props.model.children.length !== 0 &&
        !isNil(props.recursion) && (
          <MenuItems<M>
            {...props.recursion}
            getLabel={props.getLabel}
            models={props.model.children}
            level={props.level + 1}
          />
        )}
    </React.Fragment>
  );
};

export const RecursiveMenuItem = React.memo(PrivateRecursiveMenuItem) as typeof PrivateRecursiveMenuItem;
