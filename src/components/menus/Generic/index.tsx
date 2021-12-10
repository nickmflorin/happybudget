import React, { useState, useMemo, useEffect, useRef, useImperativeHandle, useReducer } from "react";
import classNames from "classnames";
import { map, isNil, includes, filter, find, uniqueId, forEach } from "lodash";

import { Input as AntDInput } from "antd";

import { hooks, ui, util } from "lib";
import { RenderWithSpinner, ShowHide } from "components";
import { Button } from "components/buttons";
import { SearchInput } from "components/fields";

import { ExtraMenuItem, MenuItem } from "./MenuItem";

type GenericExtraItem = { extra: ExtraMenuItemModel };
type GenericModelItem<S extends object = MenuItemSelectedState, M extends MenuItemModel<S> = MenuItemModel<S>> = {
  model: M;
};
type GenericItem<S extends object = MenuItemSelectedState, M extends MenuItemModel<S> = MenuItemModel<S>> =
  | GenericExtraItem
  | GenericModelItem<S, M>;

const isModelItem = <S extends object = MenuItemSelectedState, M extends MenuItemModel<S> = MenuItemModel<S>>(
  item: GenericItem<S, M>
): item is GenericModelItem<S, M> => {
  return (item as GenericModelItem<S, M>).model !== undefined;
};

type MenuState<S extends object = MenuItemSelectedState, M extends MenuItemModel<S> = MenuItemModel<S>> = {
  readonly focusedIndex: number | null;
  readonly availableItems: GenericItem<S, M>[];
};

const initialMenuState: MenuState<any, any> = {
  focusedIndex: 0,
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
  S extends object = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
> = {
  readonly type: "SET_AVAILABLE_ITEMS";
  readonly models: M[];
  readonly availableExtras: ExtraMenuItemModel[];
};

type MenuStateAction<S extends object = MenuItemSelectedState, M extends MenuItemModel<S> = MenuItemModel<S>> =
  | FocusedIndexChangeAction
  | FocusedIndexSetAction
  | SetAvailableItemsAction<S, M>;

const menuStateReducer = <S extends object = MenuItemSelectedState, M extends MenuItemModel<S> = MenuItemModel<S>>(
  state: MenuState<S, M> = initialMenuState,
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

const Menu = <S extends object = MenuItemSelectedState, M extends MenuItemModel<S> = MenuItemModel<S>>(
  props: IMenu<S, M> & { readonly menu?: NonNullRef<IMenuRef<S, M>> }
): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<AntDInput>(null);
  const [menuState, dispatchMenuState]: [MenuState<S, M>, (action: MenuStateAction<S, M>) => void] = useReducer(
    menuStateReducer,
    initialMenuState
  ) as [MenuState<S, M>, (action: MenuStateAction<S, M>) => void];

  const [focused, setFocused] = useState(false);

  const menu = ui.hooks.useMenuIfNotDefined<S, M>(props.menu);
  const menuId = useMemo(() => (!isNil(props.id) ? props.id : uniqueId("menu-")), [props.id]);

  const [_selected, setSelected] = useState<ID[]>(
    /* eslint-disable indent */
    isNil(props.defaultSelected)
      ? []
      : Array.isArray(props.defaultSelected)
      ? props.defaultSelected
      : [props.defaultSelected]
  );

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
  const models = ui.hooks.useDebouncedJSSearch<M>(search, props.models, {
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
          forEach(selectedState, (id: ID | string) => {
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
        if (search === "") {
          const indexFromSelectedState = getIndexFromSelectedState(selected);
          if (!isNil(indexFromSelectedState)) {
            dispatchMenuState({ type: "SET", payload: indexFromSelectedState });
            setIndexFromSelectedState = true;
          }
        }
        if (setIndexFromSelectedState === false) {
          let setIndexFromSearch = false;
          if (setIndexFromSearch === false && search !== "") {
            dispatchMenuState({ type: "SET", payload: 0 });
          }
        }
      }
    }
  }, [noData, noSearchResults, focused, search, selected, props.extra, menuState.availableItems]);

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

  useEffect(() => {
    !isNil(props.onFocusCallback) && props.onFocusCallback(focused);

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

  const getItemState = useMemo(() => {
    const explicitStateGetter = props.getItemState;
    if (!isNil(explicitStateGetter)) {
      return (m: M, sel: ID[]): S => explicitStateGetter(m);
    }
    return (m: M, sel: ID[], def?: { readonly id: ID; readonly selected: boolean }): S =>
      ({
        selected: !isNil(def) && def.id === m.id ? def.selected : includes(sel, getModelIdentifier(m))
      } as S);
  }, [props.getItemState]);

  const getState = useMemo(
    () =>
      (sel: ID[], def?: { readonly id: ID; readonly selected: boolean }): S[] =>
        map(props.models, (m: M) => getItemState(m, sel, def)),
    [hooks.useDeepEqualMemo(props.models), getItemState]
  );

  const getModelAttributedState = useMemo(
    () =>
      (sel: ID[], def?: { readonly id: ID; readonly selected: boolean }): MenuItemStateWithModel<S, M>[] =>
        map(props.models, (m: M) => ({ ...getItemState(m, sel, def), model: m })),
    [hooks.useDeepEqualMemo(props.models), getItemState]
  );

  const onMenuItemClick: (e: MenuItemClickEvent<S, M>) => void = hooks.useDynamicCallback(
    (e: MenuItemClickEvent<S, M>) => {
      if (mode === "single") {
        const newSelected = [getModelIdentifier(e.model)];
        setSelected(newSelected);
        e.model.onClick?.({
          event: e.event,
          closeParentDropdown: props.closeParentDropdown,
          state: getItemState(e.model, newSelected)
        });
        props.onChange?.({ ...e, menuState: getModelAttributedState(newSelected) });
      } else {
        let newSelected: ID[];
        let newDefaultState: MenuItemSelectedState = { selected: false };

        const id = getModelIdentifier(e.model);

        if (includes(selected, id)) {
          newSelected = filter(selected, (i: ID) => i !== id);
        } else {
          newSelected = [...selected, id];
          newDefaultState = { selected: true };
        }
        const state: S = getItemState(e.model, newSelected, { id, ...newDefaultState });
        e.model.onClick?.({
          event: e.event,
          closeParentDropdown: props.closeParentDropdown,
          state
        });
        setSelected(newSelected);
        props.onChange?.({
          ...e,
          /* Override the current menu item selected state because change hasn't
					   propgated yet. */
          state,
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
          onMenuItemClick({
            model: item.model,
            event,
            closeParentDropdown: props.closeParentDropdown,
            state: getItemState(item.model, selected)
          });
        } else {
          if (!isNil(item.extra.onClick)) {
            item.extra.onClick({ event, closeParentDropdown: props.closeParentDropdown });
          }
        }
      }
    }
  });

  useImperativeHandle(menu, () => ({
    /* eslint-disable indent */
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
          searchRef.current?.setState({ focused: true });
        }, 25);
        if (!isNil(searchValue)) {
          setSearch(searchValue);
        }
      } else {
        setTimeout(() => {
          searchRef.current?.blur();
          searchRef.current?.setState({ focused: false });
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
      id={props.id}
      ref={ref}
      onFocus={(e: React.FocusEvent<HTMLDivElement>) => setFocused(true)}
      onBlur={(e: React.FocusEvent<HTMLDivElement>) => setFocused(false)}
    >
      <ShowHide show={props.includeSearch}>
        <div className={"search-container"}>
          <SearchInput
            className={"input--small"}
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
        <RenderWithSpinner loading={props.loading} size={22}>
          <ul>
            <React.Fragment>
              {map(availableModelItems, (item: GenericModelItem<S, M>, index: number) => (
                <MenuItem<S, M>
                  key={`${props.id}-${item.model.id}-${index}`}
                  style={props.itemProps?.style}
                  className={props.itemProps?.className}
                  model={item.model}
                  menuId={props.id}
                  state={getItemState(item.model, selected)}
                  renderContent={props.renderItemContent}
                  focused={menuState.focusedIndex === indexMap[getModelIdentifier(item.model)]}
                  checkbox={props.checkbox}
                  closeParentDropdown={props.closeParentDropdown}
                  keepDropdownOpenOnClick={props.keepDropdownOpenOnClick}
                  getLabel={props.getItemLabel}
                  onClick={(event: MenuItemClickEvent<S, M>) => onMenuItemClick(event)}
                />
              ))}
              {map(availableExtraItems, (item: GenericExtraItem, index: number) => {
                return (
                  <ExtraMenuItem
                    key={index}
                    menuId={!isNil(props.id) ? props.id : menuId}
                    model={item.extra}
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
                className={classNames("btn btn--menu", btn.className)}
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
