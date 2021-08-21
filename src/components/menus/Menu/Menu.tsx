import React, { useState, useMemo, forwardRef, ForwardedRef, useImperativeHandle } from "react";
import classNames from "classnames";
import { map, isNil, includes, filter } from "lodash";

import MenuItem from "./MenuItem";

export type MenuWithChildrenProps = StandardComponentWithChildrenProps;
export type MenuWithItemsProps = StandardComponentProps &
  Partial<IMenu> & {
    readonly checkbox?: boolean;
    readonly items?: IMenuItem[];
    readonly mode?: "multiple" | "single";
    readonly defaultSelected?: MenuItemId[];
  };

export type MenuProps = MenuWithItemsProps | MenuWithChildrenProps;

const isPropsWithChildren = (props: MenuProps): props is MenuWithChildrenProps =>
  (props as MenuWithChildrenProps).children !== undefined;

const Menu = (props: MenuProps, ref: ForwardedRef<IMenuRef>): JSX.Element => {
  const [_selected, setSelected] = useState<MenuItemId[]>([]);
  const mode = useMemo(
    () => (isPropsWithChildren(props) ? "single" : !isNil(props.mode) ? props.mode : "single"),
    [props]
  );
  const selected = useMemo(
    () => (isPropsWithChildren(props) ? _selected : !isNil(props.selected) ? props.selected : _selected),
    [props, _selected]
  );

  useImperativeHandle(ref, () => ({
    /* eslint-disable indent */
    getState: () =>
      isPropsWithChildren(props)
        ? { selected: [], state: [] }
        : {
            selected,
            state: [
              ...map(selected, (id: MenuItemId) => ({ id, selected: true })),
              ...map(
                filter(props.items, (i: IMenuItem) => !includes(selected, i.id)),
                (i: IMenuItem) => ({ id: i.id, selected: false })
              )
            ]
          }
  }));

  return (
    <ul className={classNames("menu", props.className)} style={props.style}>
      {isPropsWithChildren(props) ? (
        props.children
      ) : (
        <React.Fragment>
          {map(props.items, (item: IMenuItem, index: number) => (
            <MenuItem
              key={index}
              {...item}
              checkbox={props.checkbox}
              selected={includes(selected, item.id)}
              defaultSelected={includes(props.defaultSelected, item.id)}
              onClick={(e: React.MouseEvent<HTMLLIElement>) => {
                if (mode === "single") {
                  setSelected([item.id]);
                  props.onChange?.({
                    selected: [item.id],
                    change: { id: item.id, selected: true },
                    state: [
                      { id: item.id, selected: true },
                      ...map(
                        filter(props.items, (i: IMenuItem) => item.id !== i.id),
                        (i: IMenuItem) => ({ id: i.id, selected: false })
                      )
                    ]
                  });
                } else {
                  let newSelected: MenuItemId[];
                  let change: IMenuItemState;
                  if (includes(selected, item.id)) {
                    newSelected = filter(selected, (id: MenuItemId) => id !== item.id);
                    change = { id: item.id, selected: false };
                  } else {
                    newSelected = [...selected, item.id];
                    change = { id: item.id, selected: true };
                  }
                  setSelected(newSelected);
                  props.onChange?.({
                    selected: newSelected,
                    change: change,
                    state: [
                      ...map(newSelected, (id: MenuItemId) => ({ id, selected: true })),
                      ...map(
                        filter(props.items, (i: IMenuItem) => !includes(newSelected, i.id)),
                        (i: IMenuItem) => ({ id: i.id, selected: false })
                      )
                    ]
                  });
                }
              }}
            />
          ))}
        </React.Fragment>
      )}
    </ul>
  );
};

export default forwardRef(Menu);
