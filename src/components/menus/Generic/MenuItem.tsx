import React, { useMemo } from "react";
import { useHistory } from "react-router-dom";
import classNames from "classnames";
import { isNil } from "lodash";

import { Checkbox } from "antd";

import { IconOrSpinner, VerticalFlexCenter, Spinner } from "components";

/* eslint-disable indent */
const PrivateCommonMenuItem = <S extends object = MenuItemSelectedState, M extends MenuItemModel<S> = MenuItemModel<S>>(
  props: ICommonMenuItem<S, M> & { readonly isExtra: boolean; readonly children: JSX.Element }
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
          props.onClick?.(e);
          if (props.model.keepDropdownOpenOnClick !== undefined) {
            props.model.keepDropdownOpenOnClick !== true && props.closeParentDropdown?.();
          } else if (props.keepDropdownOpenOnClick !== undefined) {
            props.keepDropdownOpenOnClick !== true && props.closeParentDropdown?.();
          }
        }
      }}
    >
      {props.children}
    </li>
  );
};

const CommonMenuItem = React.memo(PrivateCommonMenuItem) as typeof PrivateCommonMenuItem;

interface ContentWrapperProps {
  readonly loading?: boolean;
  readonly icon?: IconOrElement;
  readonly children: JSX.Element;
}

const ContentWrapper = (props: ContentWrapperProps): JSX.Element => {
  return (
    <React.Fragment>
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
      {props.children}
    </React.Fragment>
  );
};

export const ExtraMenuItem = <S extends object = MenuItemSelectedState>(props: IExtraMenuItem): JSX.Element => {
  if (props.model.visible === false) {
    return <></>;
  }
  return (
    <CommonMenuItem<S, any>
      {...props}
      onClick={(e: Table.CellDoneEditingEvent) => {
        props.onClick?.({
          event: e,
          closeParentDropdown: props.closeParentDropdown
        });
      }}
      isExtra={true}
    >
      <ContentWrapper icon={props.model.icon} loading={props.model.loading}>
        <VerticalFlexCenter>
          <span className={"text-wrapper"}>{props.model.label}</span>
        </VerticalFlexCenter>
      </ContentWrapper>
    </CommonMenuItem>
  );
};

type AnyMenuItemSelectedState<T extends object> = T & MenuItemSelectedState;

const isSelectedState = <T extends object>(state: T): state is AnyMenuItemSelectedState<T> =>
  (state as AnyMenuItemSelectedState<T>).selected !== undefined;

const PrivateMenuItem = <S extends object = MenuItemSelectedState, M extends MenuItemModel<S> = MenuItemModel<S>>(
  props: IMenuItem<S, M>
): JSX.Element => {
  const m = useMemo(() => {
    if (!isNil(props.label)) {
      return { ...props.model, label: props.label };
    } else if (!isNil(props.getLabel)) {
      return { ...props.model, label: props.getLabel(props.model, props.state) };
    } else {
      return props.model;
    }
  }, [props.model, props.label, props.getLabel]);

  if (props.model.visible === false) {
    return <></>;
  }

  return (
    <CommonMenuItem<S, M>
      {...props}
      isExtra={false}
      onClick={(e: Table.CellDoneEditingEvent) => {
        props.onClick?.({
          event: e,
          model: props.model,
          state: props.state,
          closeParentDropdown: props.closeParentDropdown
        });
      }}
    >
      <React.Fragment>
        {props.checkbox && isSelectedState(props.state) && <Checkbox checked={props.state.selected} />}
        <ContentWrapper icon={props.model.icon} loading={props.model.loading}>
          <React.Fragment>
            <VerticalFlexCenter>
              {!isNil(props.renderContent) ? (
                props.renderContent(m, props.state)
              ) : !isNil(m.render) ? (
                m.render()
              ) : (
                <span className={"text-wrapper"}>{m.label}</span>
              )}
            </VerticalFlexCenter>
            {!isNil(props.renderAfterLabel) && (
              <VerticalFlexCenter style={{ marginLeft: 5 }}>
                {props.renderAfterLabel(m, props.state)}
              </VerticalFlexCenter>
            )}
          </React.Fragment>
        </ContentWrapper>
      </React.Fragment>
    </CommonMenuItem>
  );
};

export const MenuItem = React.memo(PrivateMenuItem) as typeof PrivateMenuItem;
