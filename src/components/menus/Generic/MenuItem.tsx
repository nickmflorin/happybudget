import React, { ReactNode, useMemo, ForwardedRef, useState, useImperativeHandle, forwardRef } from "react";
import { useHistory } from "react-router-dom";
import classNames from "classnames";
import { isNil } from "lodash";

import { Checkbox } from "antd";

import { IconOrSpinner } from "components";

type MenuItemContentProps = {
  readonly loading?: boolean;
  readonly icon?: IconOrElement;
  readonly children: ReactNode;
  readonly iconAfterLabel?: IconOrElement;
  readonly checkbox?: boolean;
  readonly checked?: boolean;
};

const MenuItemContent = React.memo(
  (props: MenuItemContentProps): JSX.Element => (
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
  )
);

type CommonMenuItemProps<
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends BaseMenuItemModel = MenuItemModel<S>
> = Omit<StandardComponentProps, "id"> & {
  readonly model: M;
  readonly menuId: string;
  readonly focused: boolean;
  readonly keepDropdownOpenOnClick?: boolean;
  readonly isExtra: boolean;
  readonly children: JSX.Element;
  readonly closeParentDropdown?: () => void;
  readonly onClick?: (e: Table.CellDoneEditingEvent) => void;
};

const PrivateCommonMenuItem = <
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
>(
  props: CommonMenuItemProps<S, M> & MenuItemContentProps
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

type ExtraMenuItemProps<S extends Record<string, unknown> = MenuItemSelectedState> = Omit<
  StandardComponentProps,
  "id"
> &
  Omit<CommonMenuItemProps<S, ExtraMenuItemModel>, "onClick" | "isExtra" | "children"> & {
    readonly onClick?: (e: MenuExtraItemClickEvent) => void;
  };

export const ExtraMenuItem = <S extends Record<string, unknown> = MenuItemSelectedState>(
  props: ExtraMenuItemProps<S>
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

type MenuItemProps<
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
> = StandardComponentProps &
  Omit<CommonMenuItemProps<S, M>, "onClick" | "isExtra" | "children"> & {
    readonly checkbox?: boolean;
    readonly label?: string;
    readonly state: S;
    readonly getLabel?: (m: M, s: S) => string;
    readonly renderContent?: (model: M, s: S) => JSX.Element;
    readonly iconAfterLabel?: (model: M, s: S) => JSX.Element;
  };

const PrivateMenuItem = <
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
>(
  props: MenuItemProps<S, M>,
  ref: ForwardedRef<IMenuItemRef<S>>
): JSX.Element => {
  const [_loading, setLoading] = useState(false);

  const loading = useMemo(() => props.model.loading || _loading, [_loading, props.model.loading]);

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

  const partialRefObj = useMemo<Omit<IMenuItemRef<S>, "performClick">>(
    () => ({
      closeParentDropdown: props.closeParentDropdown,
      setLoading: (v: boolean) => setLoading(v),
      getState: () => props.state
    }),
    [props.closeParentDropdown, props.state]
  );

  const onClick = useMemo(
    () => (e: Table.CellDoneEditingEvent) =>
      props.model.onClick?.({
        event: e,
        state: props.state,
        item: partialRefObj
      }),
    [(props.model.onClick, props.state, partialRefObj)]
  );

  useImperativeHandle(ref, () => ({
    closeParentDropdown: props.closeParentDropdown,
    setLoading: (v: boolean) => setLoading(v),
    getState: () => props.state,
    performClick: (e: Table.CellDoneEditingEvent) => onClick(e)
  }));

  return (
    <CommonMenuItem<S, M>
      {...props}
      isExtra={false}
      icon={props.model.icon}
      loading={loading}
      iconAfterLabel={props.iconAfterLabel?.(m, props.state)}
      checkbox={props.checkbox && isSelectedState(props.state)}
      checked={isSelectedState(props.state) && props.state.selected}
      onClick={(e: Table.CellDoneEditingEvent) => onClick(e)}
    >
      {!isNil(props.renderContent) ? (
        props.renderContent(m, props.state)
      ) : (
        <div className={"text-wrapper"}>{m.label}</div>
      )}
    </CommonMenuItem>
  );
};

type MenuItemType = <
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
>(
  props: MenuItemProps<S, M> & { readonly ref: ForwardedRef<IMenuItemRef<S>> }
) => JSX.Element;

export const MenuItem = React.memo(forwardRef(PrivateMenuItem)) as MenuItemType;
