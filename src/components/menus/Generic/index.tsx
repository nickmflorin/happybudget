import React, { useState, useMemo, useEffect, useRef, useImperativeHandle, useReducer } from "react";
import classNames from "classnames";
import { map, isNil, includes, filter, find, uniqueId, forEach } from "lodash";

import { Input as AntDInput } from "antd";

import { hooks, model, ui, util } from "lib";
import { RenderWithSpinner, ShowHide } from "components";
import { Button } from "components/buttons";
import { SearchInput } from "components/fields";

import MenuItems from "./MenuItems";
import { ExtraMenuItem } from "./MenuItem";

type GenericExtraItem = { extra: ExtraMenuItemModel };
type GenericModelItem<M extends MenuItemModel> = { model: M };
type GenericItem<M extends MenuItemModel> = GenericExtraItem | GenericModelItem<M>;

const isModelItem = <M extends MenuItemModel>(item: GenericItem<M>): item is GenericModelItem<M> => {
  return (item as GenericModelItem<M>).model !== undefined;
};

type MenuState<M extends MenuItemModel> = {
  readonly focusedIndex: number | null;
  readonly availableItems: GenericItem<M>[];
};

const initialMenuState: MenuState<any> = {
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

type SetAvailableItemsAction<M extends MenuItemModel> = {
  readonly type: "SET_AVAILABLE_ITEMS";
  readonly models: M[];
  readonly availableExtras: ExtraMenuItemModel[];
};

type MenuStateAction<M extends MenuItemModel> =
  | FocusedIndexChangeAction
  | FocusedIndexSetAction
  | SetAvailableItemsAction<M>;

const menuStateReducer = <M extends MenuItemModel>(
  state: MenuState<M> = initialMenuState,
  action: MenuStateAction<M>
): MenuState<M> => {
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

const Menu = <M extends MenuItemModel>(props: IMenu<M> & { readonly menu?: NonNullRef<IMenuRef<M>> }): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<AntDInput>(null);
  const [menuState, dispatchMenuState] = useReducer(menuStateReducer, initialMenuState);

  const [focused, setFocused] = useState(false);
  const [innerFocused, setInnerFocused] = useState(false);

  const firstRender = ui.hooks.useTrackFirstRender();
  const menu = ui.hooks.useMenuIfNotDefined<M>(props.menu);
  const menuId = useMemo(() => (!isNil(props.id) ? props.id : uniqueId("menu-")), [props.id]);

  const [_selected, setSelected] = useState<MenuItemId[]>(
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

  const _flattenedModels = useMemo<M[]>(() => {
    const flattened: M[] = [];

    const addModel = (m: M) => {
      if (model.typeguards.isModelWithChildren(m)) {
        flattened.push(m);
        for (let i = 0; i < m.children.length; i++) {
          addModel(m.children[i]);
        }
      } else {
        flattened.push(m);
      }
    };
    map(props.models, (m: M) => addModel(m));
    return flattened;
  }, [hooks.useDeepEqualMemo(props.models)]);

  const getModelIdentifier = useMemo(
    () => (m: M) => !isNil(props.getModelIdentifier) ? props.getModelIdentifier(m) : m.id,
    [props.getModelIdentifier]
  );

  // This will only perform searching if clientSearching is not false.
  const models = ui.hooks.useDebouncedJSSearch<M>(search, _flattenedModels, {
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

  const availableModelItems = useMemo<GenericModelItem<M>[]>(() => {
    return filter(menuState.availableItems, (item: GenericItem<M>) => isModelItem(item)) as GenericModelItem<M>[];
  }, [menuState.availableItems]);

  const availableExtraItems = useMemo<GenericExtraItem[]>(() => {
    return filter(menuState.availableItems, (item: GenericExtraItem) => !isModelItem(item)) as GenericExtraItem[];
  }, [menuState.availableItems]);

  const topLevelModelItems = useMemo<GenericModelItem<M>[]>(() => {
    const topLevelIds: (number | string)[] = map(props.models, (m: M) => getModelIdentifier(m));
    return filter(availableModelItems, (item: GenericModelItem<M>) =>
      includes(topLevelIds, getModelIdentifier(item.model))
    );
  }, [hooks.useDeepEqualMemo(props.models), hooks.useDeepEqualMemo(models), availableModelItems, getModelIdentifier]);

  const getIndexFromSelectedState = useMemo(
    () =>
      (selectedState: (number | string)[]): number | null => {
        if (selectedState.length !== 0) {
          let validSelectedModel: GenericModelItem<M> | null = null;
          // TODO: In the case that there are multiple selected models (i.e. the Menu
          // is operating as multiple = true) we should see if there is a way to recover
          // the last active selection instead of defaulting to the first selected model
          // in the array.
          forEach(selectedState, (id: ID | string) => {
            const m: GenericModelItem<M> | undefined = find(
              availableModelItems,
              (item: GenericModelItem<M>) => getModelIdentifier(item.model) === id
            );
            // It might be the case that the selected model does not exist in the
            // models, beacuse the models are filtered based on the search and the
            // search might exclude the selection.
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
          (item: GenericItem<M>) =>
            !isModelItem(item) && item.extra.showOnNoData === true && item.extra.focusOnNoData === true
        ) as GenericExtraItem[];
        if (items.length !== 0) {
          dispatchMenuState({ type: "SET", payload: menuState.availableItems.indexOf(items[0]) });
        }
      } else if (noSearchResults === true) {
        const items: GenericExtraItem[] = filter(
          menuState.availableItems,
          (item: GenericItem<M>) =>
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
          // If we cannot set the index based on a selected value, check to see if
          // there is a prop that returns the first model that we should select
          // in the presence of a search.
          if (!isNil(props.getFirstSearchResult)) {
            const firstModel = props.getFirstSearchResult(models);
            if (!isNil(firstModel)) {
              const index = menuState.availableItems.indexOf({ model: firstModel });
              if (!isNil(index)) {
                setIndexFromSearch = true;
                dispatchMenuState({ type: "SET", payload: index });
              }
            }
          }
          if (setIndexFromSearch === false && search !== "") {
            dispatchMenuState({ type: "SET", payload: 0 });
          }
        }
      }
    }
  }, [noData, noSearchResults, search, props.extra, props.getFirstSearchResult]);

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
    if (props.defaultFocusFirstItem === true && firstRender === true && models.length !== 0 && selected.length === 0) {
      // setInternalState({ menuFocused: true, index: 0 });
      innerRef.current?.focus();
    }
  }, [props.defaultFocusFirstItem, hooks.useDeepEqualMemo(models)]);

  // If there is only one model that is visible, either from a search or from only
  // 1 model being present, we may want it to be active/selected by default.
  useEffect(() => {
    if (
      ((models.length === 1 && props.defaultFocusOnlyItem === true) ||
        (props.defaultFocusOnlyItemOnSearch && !isNil(search) && search !== "")) &&
      firstRender === false
    ) {
      dispatchMenuState({ type: "SET", payload: 0 });
    }
  }, [hooks.useDeepEqualMemo(models), search, props.defaultFocusOnlyItemOnSearch, props.defaultFocusOnlyItem]);

  useEffect(() => {
    !isNil(props.onFocusCallback) && props.onFocusCallback(innerFocused);

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

  const stateForModel = useMemo(
    () =>
      (sel: MenuItemId[], m: M): IMenuItemState<M> => ({
        selected: includes(sel, getModelIdentifier(m)),
        model: m
      }),
    []
  );

  const stateFromSelected = useMemo(
    () =>
      (sel: MenuItemId[]): IMenuItemState<M>[] => {
        return map(
          filter(
            map(sel, (id: MenuItemId) => find(props.models, { id } as any)),
            (item: M | undefined) => !isNil(item)
          ) as M[],
          (item: M) => stateForModel(sel, item)
        );
      },
    [props.models, stateForModel]
  );

  const state = useMemo(() => stateFromSelected(selected), [selected, stateFromSelected]);

  const onMenuItemClick = hooks.useDynamicCallback((m: M, e: Table.CellDoneEditingEvent) => {
    m.onClick?.({ event: e, model: m, closeParentDropdown: props.closeParentDropdown });
    if (mode === "single") {
      setSelected([getModelIdentifier(m)]);
      props.onChange?.({
        event: e,
        model: m,
        selected: true,
        state: stateFromSelected([getModelIdentifier(m)]),
        closeParentDropdown: props.closeParentDropdown
      });
    } else {
      let newSelected: MenuItemId[];
      let wasSelected: boolean;
      if (includes(selected, getModelIdentifier(m))) {
        newSelected = filter(selected, (id: MenuItemId) => id !== getModelIdentifier(m));
        wasSelected = false;
      } else {
        newSelected = [...selected, getModelIdentifier(m)];
        wasSelected = true;
      }
      setSelected(newSelected);
      props.onChange?.({
        event: e,
        model: m,
        selected: wasSelected,
        state: stateFromSelected(newSelected),
        closeParentDropdown: props.closeParentDropdown
      });
    }
  });

  const performActionAtFocusedIndex = hooks.useDynamicCallback((event: KeyboardEvent) => {
    if (menuState.focusedIndex !== null && focused === true) {
      const item = menuState.availableItems[menuState.focusedIndex];
      if (!isNil(item)) {
        if (isModelItem(item)) {
          onMenuItemClick(item.model, event);
        } else {
          if (!isNil(item.extra.onClick)) {
            item.extra.onClick({ event, model: item.extra, closeParentDropdown: props.closeParentDropdown });
          }
        }
      }
    }
  });

  useImperativeHandle(menu, () => ({
    /* eslint-disable indent */
    getState: () => state,
    getSearchValue: () => search,
    incrementFocusedIndex: () => dispatchMenuState({ type: "INCREMENT" }),
    decrementFocusedIndex: () => dispatchMenuState({ type: "DECREMENT" }),
    focus: (value: boolean) => {
      if (value === true) {
        setTimeout(() => {
          ref.current?.focus();
          innerRef.current?.focus();
          searchRef.current?.focus();
        });
      } else {
        setTimeout(() => {
          ref.current?.blur();
          innerRef.current?.blur();
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
        const modelItems: GenericModelItem<M>[] = filter(menuState.availableItems, (item: GenericItem<M>) =>
          isModelItem(item)
        ) as GenericModelItem<M>[];
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
            // onFocus={(e: React.FocusEvent<HTMLInputElement>) => setSearchFocused(true)}
            // onBlur={(e: React.FocusEvent<HTMLInputElement>) => setSearchFocused(false)}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(event.target.value);
            }}
          />
        </div>
      </ShowHide>
      <div className={"ul-wrapper"} id={menuId}>
        <RenderWithSpinner loading={props.loading} size={22}>
          <ul
            ref={innerRef}
            onFocus={(e: React.FocusEvent<HTMLUListElement>) => setInnerFocused(true)}
            onBlur={(e: React.FocusEvent<HTMLUListElement>) => setInnerFocused(false)}
          >
            <React.Fragment>
              <MenuItems<M>
                models={map(topLevelModelItems, (item: GenericModelItem<M>) => item.model)}
                menuId={!isNil(props.id) ? props.id : menuId}
                indexMap={indexMap}
                // focusedIndex={isMenuFocusedState(internalState) ? internalState.index : null}
                focusedIndex={menuState.focusedIndex}
                checkbox={props.checkbox}
                level={0}
                selected={selected}
                keepDropdownOpenOnClick={props.keepDropdownOpenOnClick}
                levelIndent={props.levelIndent}
                itemProps={props.itemProps}
                bordersForLevels={props.bordersForLevels}
                onClick={(event: MenuItemClickEvent<M>) => onMenuItemClick(event.model, event.event)}
                renderContent={props.renderItemContent}
                closeParentDropdown={props.closeParentDropdown}
                getLabel={props.getLabel}
              />
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
          {map(props.buttons, (btn: IMenuButton<M>, index: number) => {
            return (
              <Button
                key={index}
                className={classNames("btn btn--menu", btn.className)}
                style={btn.style}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  const st = menu.current.getState();
                  btn.onClick?.({ state: st });
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
