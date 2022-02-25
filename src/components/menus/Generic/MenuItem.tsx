import React, { ReactNode, useMemo } from "react";
import { useHistory } from "react-router-dom";
import classNames from "classnames";
import { isNil } from "lodash";

import { Checkbox } from "antd";

import { IconOrSpinner } from "components";

interface MenuItemContentProps {
  readonly loading?: boolean;
  readonly icon?: IconOrElement;
  readonly children: ReactNode;
  readonly iconAfterLabel?: IconOrElement;
  readonly checkbox?: boolean;
  readonly checked?: boolean;
}

const MenuItemContent = React.memo((props: MenuItemContentProps): JSX.Element => {
  return (
    <React.Fragment>
      {props.checkbox && <Checkbox checked={props.checked} />}
      <div className={"menu-item-content"}>
        {!isNil(props.icon) && (
          <div className={"icon-wrapper-left"}>
            <IconOrSpinner loading={props.loading} icon={props.icon} />
          </div>
        )}
        {isNil(props.icon) && props.loading && (
          <div className={"icon-wrapper-left"}>
            <IconOrSpinner loading={props.loading} />
          </div>
        )}
        <div className={"menu-item-inner-content"}>{props.children}</div>
        {!isNil(props.iconAfterLabel) && <div className={"icon-wrapper-right"}>{props.iconAfterLabel}</div>}
      </div>
    </React.Fragment>
  );
});

const PrivateCommonMenuItem = <
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
>(
  props: ICommonMenuItem<S, M> & { readonly isExtra: boolean; readonly children: JSX.Element } & MenuItemContentProps
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
          // First, check if the model itself overrides the dropdown visibility.
          if (props.model.keepDropdownOpenOnClick !== undefined) {
            if (props.model.keepDropdownOpenOnClick !== true) {
              props.closeParentDropdown?.();
            }
          } else {
            if (props.keepDropdownOpenOnClick !== true) {
              props.closeParentDropdown?.();
            }
          }
        }
      }}
    >
      <MenuItemContent {...props}>{props.children}</MenuItemContent>
    </li>
  );
};

const CommonMenuItem = React.memo(PrivateCommonMenuItem) as typeof PrivateCommonMenuItem;

export const ExtraMenuItem = <S extends Record<string, unknown> = MenuItemSelectedState>(
  props: IExtraMenuItem
): JSX.Element => {
  if (props.model.visible === false) {
    return <></>;
  }
  return (
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    <CommonMenuItem<S, any>
      {...props}
      icon={props.model.icon}
      loading={props.model.loading}
      onClick={(e: Table.CellDoneEditingEvent) => {
        props.onClick?.({
          event: e,
          closeParentDropdown: props.closeParentDropdown
        });
      }}
      isExtra={true}
    >
      <div className={"text-wrapper"}>{props.model.label}</div>
    </CommonMenuItem>
  );
};

type AnyMenuItemSelectedState<T extends Record<string, unknown>> = T & MenuItemSelectedState;

const isSelectedState = <T extends Record<string, unknown>>(state: T): state is AnyMenuItemSelectedState<T> =>
  (state as AnyMenuItemSelectedState<T>).selected !== undefined;

const PrivateMenuItem = <
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
>(
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
      icon={props.model.icon}
      loading={props.model.loading}
      iconAfterLabel={props.iconAfterLabel?.(m, props.state)}
      checkbox={props.checkbox && isSelectedState(props.state)}
      checked={isSelectedState(props.state) && props.state.selected}
      onClick={(e: Table.CellDoneEditingEvent) => {
        props.onClick?.({
          event: e,
          model: props.model,
          state: props.state,
          closeParentDropdown: props.closeParentDropdown
        });
      }}
    >
      {!isNil(props.renderContent) ? (
        props.renderContent(m, props.state)
      ) : (
        <div className={"text-wrapper"}>{m.label}</div>
      )}
    </CommonMenuItem>
  );
};

export const MenuItem = React.memo(PrivateMenuItem) as typeof PrivateMenuItem;
