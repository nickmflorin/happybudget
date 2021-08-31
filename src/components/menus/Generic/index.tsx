import React, { useState, useMemo, useEffect, useRef, useImperativeHandle } from "react";
import classNames from "classnames";
import { map, isNil, includes, filter, find, uniqueId, forEach } from "lodash";

import { Input as AntDInput } from "antd";

import { hooks, model, ui, util } from "lib";
import { RenderWithSpinner, ShowHide } from "components";
import { Button } from "components/buttons";
import { SearchInput } from "components/fields";

import MenuItems from "./MenuItems";
import { ExtraMenuItem } from "./MenuItem";

type MenuUnfocusedState = {
  readonly menuFocused: false;
};

type MenuFocusedState = {
  readonly menuFocused: true;
  readonly index: number;
};

type MenuState = MenuFocusedState | MenuUnfocusedState;

type GenericExtraItem = { extra: ExtraMenuItemModel };
type GenericModelItem<M extends MenuItemModel> = { model: M };
type GenericItem<M extends MenuItemModel> = GenericExtraItem | GenericModelItem<M>;

const isModelItem = <M extends MenuItemModel>(item: GenericItem<M>): item is GenericModelItem<M> => {
  return (item as GenericModelItem<M>).model !== undefined;
};

const isMenuFocusedState = (state: MenuState): state is MenuFocusedState => {
  return (state as MenuFocusedState).menuFocused === true;
};

const isMenuUnfocusedState = (state: MenuState): state is MenuUnfocusedState => {
  return (state as MenuUnfocusedState).menuFocused === false;
};

const Menu = <M extends MenuItemModel>(props: IMenu<M> & { readonly menu?: NonNullRef<IMenuRef<M>> }): JSX.Element => {
  const firstRender = ui.hooks.useTrackFirstRender();
  const searchRef = useRef<AntDInput>(null);
  const menu = ui.hooks.useMenuIfNotDefined<M>(props.menu);
  const menuId = useMemo(() => (!isNil(props.id) ? props.id : uniqueId("menu-")), [props.id]);
  const [internalState, setInternalState] = useState<MenuState>({ menuFocused: false });
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

  // This will only perform searching if clientSearching is not false.
  const _filteredModels = ui.hooks.useDebouncedJSSearch<M>(search, _flattenedModels, {
    indices: props.searchIndices || ["id"],
    disabled: props.includeSearch !== true || props.clientSearching !== true
  });

  const models = useMemo<M[]>(() => {
    if (props.clientSearching === true) {
      return _filteredModels;
    }
    return _flattenedModels;
  }, [hooks.useDeepEqualMemo(_filteredModels), hooks.useDeepEqualMemo(_flattenedModels), props.clientSearching]);

  const indexMap = useMemo<{ [key: string]: number }>(() => {
    const mapping: { [key: string]: number } = {};
    map(models, (m: M, index: number) => {
      mapping[String(m.id)] = index;
    });
    return mapping;
  }, [hooks.useDeepEqualMemo(models)]);

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

  const availableItems = useMemo((): GenericItem<M>[] => {
    return [
      ...map(models, (m: M) => ({ model: m })),
      ...map(availableExtras, (e: ExtraMenuItemModel) => ({ extra: e }))
    ];
  }, [models, availableExtras]);

  const availableModelItems = useMemo<GenericModelItem<M>[]>(() => {
    return filter(availableItems, (item: GenericItem<M>) => isModelItem(item)) as GenericModelItem<M>[];
  }, [availableItems]);

  const availableExtraItems = useMemo<GenericExtraItem[]>(() => {
    return filter(availableItems, (item: GenericExtraItem) => !isModelItem(item)) as GenericExtraItem[];
  }, [availableItems]);

  const topLevelModelItems = useMemo<GenericModelItem<M>[]>(() => {
    const topLevelIds: (number | string)[] = map(props.models, (m: M) => m.id);
    return filter(availableModelItems, (item: GenericModelItem<M>) => includes(topLevelIds, item.model.id));
  }, [hooks.useDeepEqualMemo(props.models), hooks.useDeepEqualMemo(models), availableModelItems]);

  const setIndexFromSelectedState = (selectedState: (number | string)[]) => {
    if (selectedState.length !== 0) {
      let validSelectedModel: GenericModelItem<M> | null = null;
      // TODO: In the case that there are multiple selected models (i.e. the Menu
      // is operating as multiple = true) we should see if there is a way to recover
      // the last active selection instead of defaulting to the first selected model
      // in the array.
      forEach(selectedState, (id: number | string) => {
        const m: GenericModelItem<M> | undefined = find(
          availableModelItems,
          (item: GenericModelItem<M>) => item.model.id === id
        );
        // It might be the case that the selected model does not exist in the
        // models, beacuse the models are filtered based on the search and the
        // search might exclude the selection.
        if (!isNil(m)) {
          validSelectedModel = m;
          return false;
        }
      });
      if (validSelectedModel !== null) {
        const index = availableItems.indexOf(validSelectedModel);
        if (!isNil(index)) {
          setInternalState({ menuFocused: true, index: index });
          return true;
        }
      }
    }
    return false;
  };

  useEffect(() => {
    setIndexFromSelectedState(selected);
  }, [hooks.useDeepEqualMemo(selected)]);

  useEffect(() => {
    if (isMenuFocusedState(internalState)) {
      if (noData === true) {
        const items: GenericExtraItem[] = filter(
          availableItems,
          (item: GenericItem<M>) =>
            !isModelItem(item) && item.extra.showOnNoData === true && item.extra.focusOnNoData === true
        ) as GenericExtraItem[];
        if (items.length !== 0) {
          setInternalState({
            menuFocused: true,
            index: availableItems.indexOf(items[0])
          });
        }
      } else if (noSearchResults === true) {
        const items: GenericExtraItem[] = filter(
          availableItems,
          (item: GenericItem<M>) =>
            !isModelItem(item) &&
            item.extra.showOnNoSearchResults === true &&
            item.extra.focusOnNoSearchResults === true
        ) as GenericExtraItem[];
        if (items.length !== 0) {
          setInternalState({
            menuFocused: true,
            index: availableItems.indexOf(items[0])
          });
        }
      } else {
        // If we are not already in the index menuFocused state, first check to see
        // if there is a selection (i.e. value) - in which case, we will set the
        // index based on that value.
        const setIndexFromSelected = setIndexFromSelectedState(selected);

        if (setIndexFromSelected === false) {
          // If we cannot set the index based on a selected value, check to see if
          // there is a prop that returns the first model that we should select.
          let setIndexFromSearch = false;
          if (!isNil(props.getFirstSearchResult)) {
            const firstModel = props.getFirstSearchResult(models);
            if (!isNil(firstModel)) {
              const index = availableItems.indexOf({ model: firstModel });
              if (!isNil(index)) {
                setIndexFromSearch = true;
                setInternalState({ menuFocused: true, index: index });
              }
            }
          }
          // If we could not infer the index based on a selected model or the prop callback,
          // set to the first index if there is a search.
          if (setIndexFromSearch === false && props.search !== "") {
            setInternalState({ menuFocused: true, index: 0 });
          } else {
            setInternalState({ menuFocused: false });
          }
        }
      }
    }
  }, [noData, noSearchResults, props.search, props.extra]);

  useEffect(() => {
    if (isMenuFocusedState(internalState)) {
      scrollIndexIntoView(internalState.index);
    }
  }, [internalState]);

  useEffect(() => {
    if (props.defaultFocusFirstItem === true && firstRender === true && models.length !== 0 && selected.length === 0) {
      setInternalState({ menuFocused: true, index: 0 });
    }
  }, [props.defaultFocusFirstItem, hooks.useDeepEqualMemo(models)]);

  // If there is only one model that is visible, either from a search or from only
  // 1 model being present, we may want it to be active/selected by default.
  useEffect(() => {
    if (
      ((models.length === 1 && props.defaultFocusOnlyItem === true) ||
        (props.defaultFocusOnlyItemOnSearch && !isNil(props.search) && props.search !== "")) &&
      firstRender === false
    ) {
      setInternalState({ menuFocused: true, index: 0 });
    }
  }, [hooks.useDeepEqualMemo(models), props.search, props.defaultFocusOnlyItemOnSearch, props.defaultFocusOnlyItem]);

  const _focusSearch = () => {
    setTimeout(() => {
      searchRef.current?.focus();
      searchRef.current?.setState({ focused: true });
    }, 25);
  };
  const _blurSearch = () => {
    setTimeout(() => {
      searchRef.current?.blur();
      searchRef.current?.setState({ focused: false });
    }, 25);
  };

  const focusSearch = hooks.useDynamicCallback((value: boolean, searchValue?: string, unfocusMenu = false) => {
    if (value === true) {
      _focusSearch();
      if (unfocusMenu) {
        setInternalState({ menuFocused: false });
      } else {
        setInternalState({ menuFocused: true, index: 0 });
      }
      if (!isNil(searchValue)) {
        setSearch(searchValue);
      }
    } else {
      _blurSearch();
      setInternalState({ menuFocused: true, index: 0 });
    }
  });

  useEffect(() => {
    !isNil(props.onFocusCallback) && props.onFocusCallback(internalState.menuFocused);

    const menuFocusedKeyListener = (e: KeyboardEvent) => {
      if (util.events.isCharacterKeyPress(e) || util.events.isBackspaceKeyPress(e)) {
        const searchInput = searchRef.current;
        if (!isNil(searchInput)) {
          searchInput.focus();
        }
      } else {
        if (e.code === "Enter" || e.code === "Tab") {
          performActionAtFocusedIndex(e);
        } else if (e.code === "ArrowDown") {
          e.stopPropagation();
          e.preventDefault();
          incrementFocusedIndex();
        } else if (e.code === "ArrowUp") {
          e.stopPropagation();
          e.preventDefault();
          decrementFocusedIndex();
        }
      }
    };

    const menuUnfocusedKeyListener = (e: KeyboardEvent) => {
      if (e.code === "ArrowDown") {
        e.stopPropagation();
        e.preventDefault();
        focusSearch(false);
      }
    };

    if (internalState.menuFocused === true) {
      window.addEventListener("keydown", menuFocusedKeyListener);
      return () => window.removeEventListener("keydown", menuFocusedKeyListener);
    } else {
      window.addEventListener("keydown", menuUnfocusedKeyListener);
      return () => window.removeEventListener("keydown", menuUnfocusedKeyListener);
    }
  }, [internalState.menuFocused]);

  const stateForModel = useMemo(
    () =>
      (sel: MenuItemId[], m: M): IMenuItemState<M> => ({
        selected: includes(sel, m.id),
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

  const scrollIndexIntoView = (index: number) => {
    const m: M = props.models[index];
    const menuElement = document.getElementById(menuId);
    if (!isNil(menuElement) && !isNil(m)) {
      const item = document.getElementById(`menu-${menuId}-item-${m.id}`);
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

  const incrementFocusedIndex = hooks.useDynamicCallback(() => {
    if (isMenuFocusedState(internalState)) {
      if (internalState.index + 1 < availableItems.length) {
        setInternalState({ menuFocused: true, index: internalState.index + 1 });
      }
    } else {
      focusSearch(false);
    }
  });

  const decrementFocusedIndex = hooks.useDynamicCallback(() => {
    if (isMenuFocusedState(internalState)) {
      if (internalState.index > 0) {
        setInternalState({ menuFocused: true, index: internalState.index - 1 });
      } else {
        focusSearch(true);
      }
    }
  });

  const onMenuItemClick = hooks.useDynamicCallback((m: M, e: Table.CellDoneEditingEvent) => {
    m.onClick?.({ event: e, model: m, closeParentDropdown: props.closeParentDropdown });
    if (mode === "single") {
      setSelected([m.id]);
      props.onChange?.({
        event: e,
        model: m,
        selected: true,
        state: stateFromSelected([m.id]),
        closeParentDropdown: props.closeParentDropdown
      });
    } else {
      let newSelected: MenuItemId[];
      let wasSelected: boolean;
      if (includes(selected, m.id)) {
        newSelected = filter(selected, (id: MenuItemId) => id !== m.id);
        wasSelected = false;
      } else {
        newSelected = [...selected, m.id];
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
    if (isMenuFocusedState(internalState)) {
      const item = availableItems[internalState.index];
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
    incrementFocusedIndex,
    decrementFocusedIndex,
    focusMenu: (value: boolean) => {
      // If the state is just { menuFocused: false }, the hook will set the specific
      // state depending on the props supplied to the menu.
      if (value === true && isMenuUnfocusedState(internalState) && availableItems.length !== 0) {
        setInternalState({ menuFocused: true, index: 0 });
      } else if (value === false && isMenuFocusedState(internalState)) {
        setInternalState({ menuFocused: false });
      }
    },
    focusSearch: focusSearch,
    getModelAtFocusedIndex: () => {
      if (isMenuFocusedState(internalState)) {
        const modelItems: GenericModelItem<M>[] = filter(availableItems, (item: GenericItem<M>) =>
          isModelItem(item)
        ) as GenericModelItem<M>[];
        if (!isNil(modelItems[internalState.index])) {
          return modelItems[internalState.index].model;
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
    >
      <ShowHide show={props.includeSearch}>
        <div className={"search-container"}>
          <SearchInput
            className={"input--small"}
            placeholder={props.searchPlaceholder || "Search"}
            autoFocus={true}
            value={search}
            ref={searchRef}
            style={{ maxWidth: 300, minWidth: 100 }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(event.target.value);
            }}
          />
        </div>
      </ShowHide>
      <div className={"ul-wrapper"}>
        <RenderWithSpinner loading={props.loading} size={22}>
          <ul id={!isNil(props.id) ? props.id : menuId}>
            <React.Fragment>
              <MenuItems<M>
                models={map(topLevelModelItems, (item: GenericModelItem<M>) => item.model)}
                menuId={!isNil(props.id) ? props.id : menuId}
                indexMap={indexMap}
                focusedIndex={isMenuFocusedState(internalState) ? internalState.index : null}
                checkbox={props.checkbox}
                level={0}
                selected={selected}
                levelIndent={props.levelIndent}
                itemProps={props.itemProps}
                bordersForLevels={props.bordersForLevels}
                onClick={(event: MenuItemClickEvent<M>) => onMenuItemClick(event.model, event.event)}
                renderContent={props.renderItemContent}
                closeParentDropdown={props.closeParentDropdown}
              />
              {map(availableExtraItems, (item: GenericExtraItem, index: number) => {
                return (
                  <ExtraMenuItem
                    key={index}
                    menuId={!isNil(props.id) ? props.id : menuId}
                    model={item.extra}
                    focused={
                      isMenuFocusedState(internalState) && internalState.index === index + availableModelItems.length
                    }
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
