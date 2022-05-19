import React, { RefObject, useState, useMemo, useEffect, useRef, useImperativeHandle, useReducer } from "react";
import classNames from "classnames";
import { map, isNil, includes, filter, find, uniqueId, forEach } from "lodash";

import { InputRef } from "antd";

import { hooks, ui, util, redux } from "lib";
import { RenderWithSpinner, ShowHide } from "components";
import { Button } from "components/buttons";
import { SearchInput } from "components/fields";

import { ExtraMenuItem, MenuItem } from "./MenuItem";

type GenericExtraItem = { extra: ExtraMenuItemModel };
type GenericModelItem<
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
> = {
  model: M;
};
type GenericItem<
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
> = GenericExtraItem | GenericModelItem<S, M>;

const isModelItem = <
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
>(
  item: GenericItem<S, M>
): item is GenericModelItem<S, M> => {
  return (item as GenericModelItem<S, M>).model !== undefined;
};

type MenuState<
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
> = {
  readonly focusedIndex: number | null;
  readonly availableItems: GenericItem<S, M>[];
};

const initialMenuState: MenuState<Record<string, unknown>, MenuItemModel<Record<string, unknown>>> = {
  focusedIndex: null,
  availableItems: []
};

type FocusedIndexChangeAction = {
  readonly type: "INCREMENT" | "DECREMENT";
};

type FocusedIndexSetAction = {
  readonly type: "SET";
  readonly payload: number;
};

type SetAvailableItemsAction<
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
> = {
  readonly type: "SET_AVAILABLE_ITEMS";
  readonly models: M[];
  readonly availableExtras: ExtraMenuItemModel[];
};

type MenuStateAction<
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
> = FocusedIndexChangeAction | FocusedIndexSetAction | SetAvailableItemsAction<S, M>;

const menuStateReducer = <
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
>(
  state: MenuState<S, M> = initialMenuState as MenuState<S, M>,
  action: MenuStateAction<S, M>
): MenuState<S, M> => {
  let newState = { ...state };
  if (action.type === "INCREMENT") {
    if (state.focusedIndex === null) {
      newState = { ...newState, focusedIndex: state.availableItems.length !== 0 ? 0 : null };
    } else {
      newState = {
        ...newState,
        focusedIndex: state.focusedIndex + 1 < state.availableItems.length ? state.focusedIndex + 1 : state.focusedIndex
      };
    }
  } else if (action.type === "SET") {
    newState = { ...newState, focusedIndex: action.payload };
  } else if (action.type === "DECREMENT") {
    if (state.focusedIndex === 0) {
      newState = { ...newState, focusedIndex: null };
    } else if (state.focusedIndex !== null) {
      newState = {
        ...newState,
        focusedIndex: state.focusedIndex === null ? null : Math.max(state.focusedIndex - 1, 0)
      };
    }
  } else if (action.type === "SET_AVAILABLE_ITEMS") {
    newState = {
      ...newState,
      availableItems: [
        ...map(action.models, (m: M) => ({ model: m })),
        ...map(action.availableExtras, (e: ExtraMenuItemModel) => ({ extra: e }))
      ]
    };
  }
  return newState;
};

type ItemRefs<S extends Record<string, unknown> = MenuItemSelectedState> = { [key in ID]: RefObject<IMenuItemRef<S>> };

const Menu = <S extends Record<string, unknown> = MenuItemSelectedState, M extends MenuItemModel<S> = MenuItemModel<S>>(
  props: IMenu<S, M> & { readonly menu?: NonNullRef<IMenuRef<S, M>> }
): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<ItemRefs<S>>({} as ItemRefs<S>);

  const searchRef = useRef<InputRef>(null);
  const [menuState, dispatchMenuState]: [MenuState<S, M>, (action: MenuStateAction<S, M>) => void] = useReducer(
    menuStateReducer,
    initialMenuState
  ) as [MenuState<S, M>, (action: MenuStateAction<S, M>) => void];

  const [focused, setFocused] = useState(false);

  const menu = ui.menu.useMenuIfNotDefined<S, M>(props.menu);
  const menuId = useMemo(() => (!isNil(props.id) ? props.id : uniqueId("menu-")), [props.id]);

  const defaultSelected = useMemo(
    () =>
      isNil(props.defaultSelected)
        ? []
        : Array.isArray(props.defaultSelected)
        ? props.defaultSelected
        : [props.defaultSelected],
    [props.defaultSelected]
  );

  /* The selection state internal to the component in the case that the component
     is unmanaged (i.e. we are not passing in the selection state to the
     component explicitly). */
  const { selected: _selected, toggle } = redux.useSelection(props.mode || "single", defaultSelected);

  /* The "true" selected state that chooses between the explicitly passed in
     selected state or the internal selected state based on whether or not the
     explicit selected state is passed in. */
  const selected = useMemo(
    () => (!isNil(props.selected) ? (Array.isArray(props.selected) ? props.selected : [props.selected]) : _selected),
    [props.selected, _selected]
  );

  useEffect(() => {
    return () => ref.current?.blur();
  }, []);

  const [_search, _setSearch] = useState("");
  const search = useMemo(() => (!isNil(props.search) ? props.search : _search), [props.search, _search]);
  const mode = useMemo(() => (!isNil(props.mode) ? props.mode : "single"), [props]);
  const setSearch = useMemo(
    () => (value: string) => {
      _setSearch(value);
      if (!isNil(props.onSearch)) {
        props.onSearch(value);
      }
    },
    [props.onSearch]
  );

  const getModelIdentifier = useMemo(
    () => (m: M) => !isNil(props.getModelIdentifier) ? props.getModelIdentifier(m) : m.id,
    [props.getModelIdentifier]
  );

  // This will only perform searching if clientSearching is not false.
  const models = ui.useDebouncedJSSearch<M>(search, props.models, {
    indices: props.searchIndices || ["id"],
    disabled: props.includeSearch !== true || props.clientSearching !== true
  });

  const indexMap = useMemo<{ [key: string]: number }>(() => {
    const mapping: { [key: string]: number } = {};
    map(models, (m: M, index: number) => {
      mapping[String(getModelIdentifier(m))] = index;
    });
    return mapping;
  }, [hooks.useDeepEqualMemo(models), getModelIdentifier]);

  const noData = useMemo(() => {
    return props.models.length === 0;
  }, [props.models]);

  const noSearchResults = useMemo(() => {
    return noData === false && models.length === 0;
  }, [noData, models]);

  const availableExtras = useMemo<ExtraMenuItemModel[]>((): ExtraMenuItemModel[] => {
    if (!isNil(props.extra)) {
      if (noData === true) {
        return filter(props.extra, (item: ExtraMenuItemModel) => item.showOnNoData === true);
      } else if (noSearchResults === true) {
        return filter(props.extra, (item: ExtraMenuItemModel) => item.showOnNoSearchResults === true);
      } else {
        return filter(props.extra, (item: ExtraMenuItemModel) => item.leaveAtBottom === true);
      }
    }
    return [];
  }, [props.extra, noData, noSearchResults]);

  useEffect(() => {
    dispatchMenuState({
      type: "SET_AVAILABLE_ITEMS",
      models,
      availableExtras
    });
  }, [models, availableExtras]);

  const availableModelItems = useMemo<GenericModelItem<S, M>[]>(() => {
    return filter(menuState.availableItems, (item: GenericItem<S, M>) => isModelItem(item)) as GenericModelItem<S, M>[];
  }, [menuState.availableItems]);

  const availableExtraItems = useMemo<GenericExtraItem[]>(() => {
    return filter(menuState.availableItems, (item: GenericExtraItem) => !isModelItem(item)) as GenericExtraItem[];
  }, [menuState.availableItems]);

  const getIndexFromSelectedState = useMemo(
    () =>
      (selectedState: (number | string)[]): number | null => {
        if (selectedState.length !== 0) {
          let validSelectedModel: GenericModelItem<S, M> | null = null;
          /* TODO: In the case that there are multiple selected models (i.e.
						 the Menu is operating as multiple = true) we should see if there is
						 a way to recover the last active selection instead of defaulting to
						 the first selected model in the array. */
          forEach(selectedState, (id: M["id"] | string) => {
            const m: GenericModelItem<S, M> | undefined = find(
              availableModelItems,
              (item: GenericModelItem<S, M>) => getModelIdentifier(item.model) === id
            );
            /* It might be the case that the selected model does not exist in the
               models, beacuse the models are filtered based on the search and the
               search might exclude the selection. */
            if (!isNil(m)) {
              validSelectedModel = m;
              return null;
            }
          });
          if (validSelectedModel !== null) {
            const index = menuState.availableItems.indexOf(validSelectedModel);
            if (!isNil(index)) {
              return index;
            }
          }
        }
        return null;
      },
    [availableModelItems]
  );

  useEffect(() => {
    if (focused === true) {
      if (noData === true) {
        const items: GenericExtraItem[] = filter(
          menuState.availableItems,
          (item: GenericItem<S, M>) =>
            !isModelItem(item) && item.extra.showOnNoData === true && item.extra.focusOnNoData === true
        ) as GenericExtraItem[];
        if (items.length !== 0) {
          dispatchMenuState({ type: "SET", payload: menuState.availableItems.indexOf(items[0]) });
        }
      } else if (noSearchResults === true) {
        const items: GenericExtraItem[] = filter(
          menuState.availableItems,
          (item: GenericItem<S, M>) =>
            !isModelItem(item) &&
            item.extra.showOnNoSearchResults === true &&
            item.extra.focusOnNoSearchResults === true
        ) as GenericExtraItem[];
        if (items.length !== 0) {
          dispatchMenuState({ type: "SET", payload: menuState.availableItems.indexOf(items[0]) });
        }
      } else {
        let setIndexFromSelectedState = false;
        if (search === "" && props.setFocusedFromSelectedState !== false) {
          const indexFromSelectedState = getIndexFromSelectedState(selected);
          if (!isNil(indexFromSelectedState)) {
            dispatchMenuState({ type: "SET", payload: indexFromSelectedState });
            setIndexFromSelectedState = true;
          }
        }
        if (setIndexFromSelectedState === false) {
          const setIndexFromSearch = false;
          if (setIndexFromSearch === false && search !== "") {
            dispatchMenuState({ type: "SET", payload: 0 });
          }
        }
      }
    }
  }, [
    noData,
    noSearchResults,
    focused,
    search,
    selected,
    props.extra,
    menuState.availableItems,
    props.setFocusedFromSelectedState
  ]);

  useEffect(() => {
    const scrollIndexIntoView = (index: number) => {
      const m: M = models[index];
      const menuElement = document.getElementById(menuId);
      if (!isNil(menuElement) && !isNil(m)) {
        const item = document.getElementById(`${menuId}-item-${getModelIdentifier(m)}`);
        if (!isNil(item)) {
          const top = menuElement.scrollTop;
          const bottom = menuElement.scrollTop + menuElement.clientHeight;
          const itemTop = item.offsetTop;
          const itemBottom = item.offsetTop + item.clientHeight;
          if (itemTop < top) {
            menuElement.scrollTop -= top - itemTop;
          } else if (itemBottom > bottom) {
            menuElement.scrollTop += itemBottom - bottom;
          }
        }
      }
    };
    if (!isNil(menuState.focusedIndex)) {
      scrollIndexIntoView(menuState.focusedIndex);
    }
  }, [menuState.focusedIndex, menuId]);

  const getItemState = useMemo(() => {
    const explicitStateGetter = props.getItemState;
    if (!isNil(explicitStateGetter)) {
      return (m: M): S => explicitStateGetter(m);
    }
    return (m: M, sel: M["id"][], def?: { readonly id: M["id"]; readonly selected: boolean }): S =>
      ({
        selected: !isNil(def) && def.id === m.id ? def.selected : includes(sel, getModelIdentifier(m))
      } as unknown as S);
  }, [props.getItemState, getModelIdentifier]);

  const getState = useMemo(
    () =>
      (sel: M["id"][], def?: { readonly id: M["id"]; readonly selected: boolean }): S[] =>
        map(props.models, (m: M) => getItemState(m, sel, def)),
    [hooks.useDeepEqualMemo(props.models), getItemState]
  );

  const getModelAttributedState = useMemo(
    () =>
      (sel: M["id"][], def?: { readonly id: M["id"]; readonly selected: boolean }): MenuItemStateWithModel<S, M>[] =>
        map(props.models, (m: M) => ({ ...getItemState(m, sel, def), model: m })),
    [hooks.useDeepEqualMemo(props.models), getItemState]
  );

  const onMenuItemClick: (e: MenuItemModelClickEvent<S>, m: M) => void = hooks.useDynamicCallback(
    (e: MenuItemModelClickEvent<S>, m: M) => {
      const id = getModelIdentifier(m);

      toggle(id);

      if (mode === "single") {
        props.onChange?.({ ...e, model: m, menu: menu.current, menuState: getModelAttributedState([id]) });
      } else {
        let newSelected: M["id"][];
        let newDefaultState: MenuItemSelectedState = { selected: false };

        /* We have to calculate the new selected state explicitly here because
           the state will not have been updated via `toggle` at this point yet. */
        if (includes(selected, id)) {
          newSelected = filter(selected, (i: M["id"]) => i !== id);
        } else {
          newSelected = [...selected, id];
          newDefaultState = { selected: true };
        }
        const state: S = getItemState(m, newSelected, { id, ...newDefaultState });
        props.onChange?.({
          ...e,
          /* Override the current menu item selected state because change hasn't
             propgated yet. */
          state,
          model: m,
          menu: menu.current,
          menuState: getModelAttributedState(newSelected, { id, ...newDefaultState })
        });
      }
    }
  );

  const performActionAtFocusedIndex = hooks.useDynamicCallback((event: KeyboardEvent) => {
    if (menuState.focusedIndex !== null && focused === true) {
      const item = menuState.availableItems[menuState.focusedIndex];
      if (!isNil(item)) {
        if (isModelItem(item)) {
          const itemRef = itemRefs.current[item.model.id];
          if (!isNil(itemRef) && !isNil(itemRef.current)) {
            itemRef.current.performClick(event);
          }
        } else {
          if (!isNil(item.extra.onClick)) {
            item.extra.onClick({ event, closeParentDropdown: props.closeParentDropdown });
          }
        }
      }
    }
  });

  useEffect(() => {
    const menuFocusedKeyListener = (e: KeyboardEvent) => {
      if (util.events.isCharacterKeyPress(e) || util.events.isBackspaceKeyPress(e)) {
        searchRef.current?.focus();
      } else {
        if (e.code === "Enter" || e.code === "Tab") {
          performActionAtFocusedIndex(e);
        } else if (e.code === "ArrowDown") {
          e.stopPropagation();
          e.preventDefault();
          dispatchMenuState({ type: "INCREMENT" });
        } else if (e.code === "ArrowUp") {
          e.stopPropagation();
          e.preventDefault();
          dispatchMenuState({ type: "DECREMENT" });
        }
      }
    };
    if (focused) {
      window.addEventListener("keydown", menuFocusedKeyListener);
    } else {
      window.removeEventListener("keydown", menuFocusedKeyListener);
    }
    return () => {
      window.removeEventListener("keydown", menuFocusedKeyListener);
    };
  }, [focused]);

  useImperativeHandle(menu, () => ({
    setItemLoading: (id: M["id"], v: boolean) => {
      const rf = itemRefs.current[id];
      if (isNil(rf)) {
        console.warn(`Cannot set item ${id} loading state because there is not an item with that ID.`);
      } else if (!isNil(rf.current)) {
        rf.current.setLoading(v);
      }
    },
    getState: () => getState(selected),
    getSearchValue: () => search,
    incrementFocusedIndex: () => dispatchMenuState({ type: "INCREMENT" }),
    decrementFocusedIndex: () => dispatchMenuState({ type: "DECREMENT" }),
    focus: (value: boolean) => {
      if (value === true) {
        setTimeout(() => {
          ref.current?.focus();
          searchRef.current?.focus();
        });
      } else {
        setTimeout(() => {
          ref.current?.blur();
          searchRef.current?.blur();
        });
      }
    },
    focusSearch: (value: boolean, searchValue?: string) => {
      if (value === true) {
        setTimeout(() => {
          searchRef.current?.focus();
        }, 25);
        if (!isNil(searchValue)) {
          setSearch(searchValue);
        }
      } else {
        setTimeout(() => {
          searchRef.current?.blur();
        }, 25);
      }
    },
    getModelAtFocusedIndex: () => {
      if (menuState.focusedIndex !== null && focused === true) {
        const modelItems: GenericModelItem<S, M>[] = filter(menuState.availableItems, (item: GenericItem<S, M>) =>
          isModelItem(item)
        ) as GenericModelItem<S, M>[];
        if (!isNil(modelItems[menuState.focusedIndex])) {
          return modelItems[menuState.focusedIndex].model;
        }
      }
      return null;
    },
    performActionAtFocusedIndex
  }));

  return (
    <div
      className={classNames("menu", props.className, { "with-search": props.includeSearch })}
      style={props.style}
      id={menuId}
      ref={ref}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <ShowHide show={props.includeSearch}>
        <div className={"search-container"}>
          <SearchInput
            small={true}
            placeholder={props.searchPlaceholder || "Search"}
            value={search}
            ref={searchRef}
            style={{ maxWidth: 300, minWidth: 100 }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(event.target.value);
            }}
          />
        </div>
      </ShowHide>
      <div className={"ul-wrapper"} id={menuId}>
        <RenderWithSpinner loading={props.loading} spinnerProps={{ size: "small" }}>
          <ul>
            <React.Fragment>
              {map(availableModelItems, (item: GenericModelItem<S, M>, index: number) => {
                let rf: RefObject<IMenuItemRef<S>> | undefined = itemRefs.current[item.model.id];
                if (isNil(rf)) {
                  rf = React.createRef<IMenuItemRef<S>>();
                  itemRefs.current[item.model.id] = rf;
                }
                return (
                  <MenuItem<S, M>
                    key={`${menuId}-${item.model.id}-${index}`}
                    style={props.itemProps?.style}
                    ref={rf}
                    className={props.itemProps?.className}
                    model={{
                      ...item.model,
                      onClick: (e: MenuItemModelClickEvent<S>) => {
                        /* We have to mutate the model onClick behavior such that
                           the Menu can also trigger the onChange handler in the
                           event that an item is clicked. */
                        item.model.onClick?.(e);
                        onMenuItemClick(e, item.model);
                      }
                    }}
                    menuId={menuId}
                    state={getItemState(item.model, selected)}
                    renderContent={props.renderItemContent || item.model.renderContent}
                    iconAfterLabel={props.itemIconAfterLabel}
                    focused={
                      (item.model.defaultFocused && menuState.focusedIndex === null) ||
                      menuState.focusedIndex === indexMap[getModelIdentifier(item.model)]
                    }
                    checkbox={props.checkbox}
                    closeParentDropdown={props.closeParentDropdown}
                    keepDropdownOpenOnClick={props.keepDropdownOpenOnClick}
                    getLabel={props.getItemLabel}
                  />
                );
              })}
              {map(availableExtraItems, (item: GenericExtraItem, index: number) => {
                return (
                  <ExtraMenuItem
                    key={index}
                    menuId={menuId}
                    model={item.extra}
                    onClick={item.extra.onClick}
                    focused={menuState.focusedIndex === index + availableModelItems.length}
                  />
                );
              })}
            </React.Fragment>
          </ul>
        </RenderWithSpinner>
      </div>
      {!isNil(props.buttons) && (
        <div className={"btn-container"}>
          {map(props.buttons, (btn: IMenuButton<S, M>, index: number) => {
            return (
              <Button
                key={index}
                className={classNames("btn--menu", btn.className)}
                style={btn.style}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  btn.onClick?.({ event: e, menuState: getModelAttributedState(selected) });
                  if (btn.keepDropdownOpenOnClick !== true) {
                    props.closeParentDropdown?.();
                  }
                }}
              >
                {btn.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(Menu) as typeof Menu;
