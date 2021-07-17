import React, { useImperativeHandle, useEffect, useState, useMemo, SyntheticEvent } from "react";
import { map, isNil, includes, filter, find, forEach, uniqueId } from "lodash";
import classNames from "classnames";

import { RenderWithSpinner, Menu } from "components";
import { useDeepEqualMemo, useDebouncedJSSearch, useTrackFirstRender, useDynamicCallback } from "lib/hooks";

import { ModelMenuItems, ExtraModelMenuItem } from "./ModelMenuItem";
import { isMultipleModelMenuProps, isModelWithChildren } from "./typeguards";
import "./ModelMenu.scss";

type MenuUnfocusedState = {
  readonly focused: false;
};

type MenuFocusedState = {
  readonly focused: true;
  readonly index: number;
};

type MenuState = MenuFocusedState | MenuUnfocusedState;

type GenericExtraItem = { extra: IExtraModelMenuItem };
type GenericModelItem<M extends Model.M> = { model: M };
type GenericItem<M extends Model.M> = GenericExtraItem | GenericModelItem<M>;

const isModelItem = <M extends Model.M>(item: GenericItem<M>): item is GenericModelItem<M> => {
  return (item as GenericModelItem<M>).model !== undefined;
};

const isFocusedState = (state: MenuState): state is MenuFocusedState => {
  return (state as MenuFocusedState).focused === true;
};

const isUnfocusedState = (state: MenuState): state is MenuUnfocusedState => {
  return (state as MenuUnfocusedState).focused === false;
};

const ModelMenu = <M extends Model.M>(props: ModelMenuProps<M>): JSX.Element => {
  const [selected, setSelected] = useState<(number | string)[]>([]);
  const [state, setState] = useState<MenuState>({ focused: false });
  const firstRender = useTrackFirstRender();
  const menuId = useMemo(() => (!isNil(props.id) ? props.id : uniqueId("model-menu-")), [props.id]);

  const _flattenedModels = useMemo<M[]>(() => {
    const flattened: M[] = [];

    const addModel = (m: M) => {
      if (isModelWithChildren(m)) {
        flattened.push(m);
        for (let i = 0; i < m.children.length; i++) {
          addModel(m.children[i]);
        }
      } else {
        flattened.push(m);
      }
    };
    map(props.models, (model: M) => addModel(model));
    return flattened;
  }, [useDeepEqualMemo(props.models)]);

  // This will only perform searching if clientSearching is not false.
  const _filteredModels = useDebouncedJSSearch<M>(props.search, _flattenedModels, {
    indices: props.searchIndices || ["id"],
    disabled: props.clientSearching === false
  });

  const models = useMemo<M[]>(() => {
    if (props.clientSearching === false) {
      return _flattenedModels;
    }
    return _filteredModels;
  }, [useDeepEqualMemo(_filteredModels), useDeepEqualMemo(_flattenedModels), props.clientSearching]);

  const indexMap = useMemo<{ [key: string]: number }>(() => {
    const mapping: { [key: string]: number } = {};
    map(models, (m: M, index: number) => {
      mapping[String(m.id)] = index;
    });
    return mapping;
  }, [useDeepEqualMemo(models)]);

  useEffect(() => {
    if (isNil(props.selected)) {
      setSelected([]);
    } else {
      setSelected(Array.isArray(props.selected) ? props.selected : [props.selected]);
    }
  }, [props.selected]);

  const noData = useMemo(() => {
    return props.models.length === 0;
  }, [props.models]);

  const noSearchResults = useMemo(() => {
    return noData === false && models.length === 0;
  }, [noData, models]);

  const availableExtras = useMemo(() => {
    if (!isNil(props.extra)) {
      if (noData === true) {
        return filter(props.extra, (item: IExtraModelMenuItem) => item.showOnNoData === true);
      } else if (noSearchResults === true) {
        return filter(props.extra, (item: IExtraModelMenuItem) => item.showOnNoSearchResults === true);
      } else {
        return filter(props.extra, (item: IExtraModelMenuItem) => item.leaveAtBottom === true);
      }
    }
    return [];
  }, [props.extra, noData, noSearchResults]);

  const availableItems = useMemo((): GenericItem<M>[] => {
    return [
      ...map(models, (m: M) => ({ model: m })),
      ...map(availableExtras, (e: IExtraModelMenuItem) => ({ extra: e }))
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
  }, [useDeepEqualMemo(props.models), useDeepEqualMemo(models), availableModelItems]);

  const setIndexFromSelectedState = (selectedState: (number | string)[]) => {
    if (selectedState.length !== 0) {
      let validSelectedModel: GenericModelItem<M> | null = null;
      // TODO: In the case that there are multiple selected models (i.e. the Menu
      // is operating as multiple = true) we should see if there is a way to recover
      // the last active selection instead of defaulting to the first selected model
      // in the array.
      forEach(selectedState, (id: number | string) => {
        const modelItems: GenericModelItem<M>[] = filter(availableItems, (item: GenericItem<M>) =>
          isModelItem(item)
        ) as GenericModelItem<M>[];
        const m: GenericModelItem<M> | undefined = find(
          modelItems,
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
          setState({ focused: true, index: index });
          return true;
        }
      }
    }
    return false;
  };

  useEffect(() => {
    setIndexFromSelectedState(selected);
  }, [useDeepEqualMemo(selected)]);

  useEffect(() => {
    if (isFocusedState(state) || props.autoFocus === true) {
      if (noData === true) {
        const items: GenericExtraItem[] = filter(
          availableItems,
          (item: GenericItem<M>) =>
            !isModelItem(item) && item.extra.showOnNoData === true && item.extra.focusOnNoData === true
        ) as GenericExtraItem[];
        if (items.length !== 0) {
          setState({
            focused: true,
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
          setState({
            focused: true,
            index: availableItems.indexOf(items[0])
          });
        }
      } else {
        // If we are not already in the index focused state, first check to see
        // if there is a selection (i.e. value) - in which case, we will set the
        // index based on that value.
        let setIndexFromSelected = setIndexFromSelectedState(selected);

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
                setState({ focused: true, index: index });
              }
            }
          }
          // If we could not infer the index based on a selected model or the prop callback,
          // set to the first index if there is a search.
          if (setIndexFromSearch === false && props.search !== "") {
            setState({ focused: true, index: 0 });
          } else {
            setState({ focused: false });
          }
        }
      }
    }
  }, [noData, noSearchResults, props.search, props.autoFocus, props.extra]);

  useEffect(() => {
    if (isFocusedState(state)) {
      scrollIndexIntoView(state.index);
    }
  }, [state]);

  useEffect(() => {
    if (props.defaultFocusFirstItem === true && firstRender === true && models.length !== 0 && selected.length === 0) {
      setState({ focused: true, index: 0 });
    }
  }, [props.defaultFocusFirstItem, useDeepEqualMemo(models)]);

  // If there is only one model that is visible, either from a search or from only
  // 1 model being present, we may want it to be active/selected by default.
  useEffect(() => {
    if (
      ((models.length === 1 && props.defaultFocusOnlyItem === true) ||
        (props.defaultFocusOnlyItemOnSearch && !isNil(props.search) && props.search !== "")) &&
      firstRender === false
    ) {
      setState({ focused: true, index: 0 });
    }
  }, [useDeepEqualMemo(models), props.search, props.defaultFocusOnlyItemOnSearch, props.defaultFocusOnlyItem]);

  const incrementFocusedIndex = () => {
    if (isFocusedState(state)) {
      if (state.index + 1 < availableItems.length) {
        setState({ focused: true, index: state.index + 1 });
      }
    }
  };

  const scrollIndexIntoView = (index: number) => {
    // TODO: We have to account for the non-model items.
    const model: M = models[index];
    const menu = document.getElementById(menuId);
    if (!isNil(menu) && !isNil(model)) {
      const item = document.getElementById(`model-menu-${menuId}-item-${model.id}`);
      if (!isNil(item)) {
        const top = menu.scrollTop;
        const bottom = menu.scrollTop + menu.clientHeight;
        const itemTop = item.offsetTop;
        const itemBottom = item.offsetTop + item.clientHeight;
        if (itemTop < top) {
          menu.scrollTop -= top - itemTop;
        } else if (itemBottom > bottom) {
          menu.scrollTop += itemBottom - bottom;
        }
      }
    }
  };

  const decrementFocusedIndex = () => {
    if (isFocusedState(state)) {
      if (state.index > 0) {
        setState({ focused: true, index: state.index - 1 });
      } else {
        setState({ focused: false });
      }
    }
  };

  const onMenuItemClick = useDynamicCallback((model: M, event: SyntheticEvent | KeyboardEvent): void => {
    if (isMultipleModelMenuProps(props)) {
      const selectedModels = filter(
        map(selected, (id: number | string) => find(props.models, { id })),
        (m: M | undefined) => m !== undefined
      ) as M[];
      if (includes(selected, model.id)) {
        setSelected(filter(selected, (id: number | string) => id !== model.id));
        props.onChange(
          filter(selectedModels, (m: M) => m.id !== model.id),
          event
        );
      } else {
        setSelected([...selected, model.id]);
        props.onChange([...selectedModels, model], event);
      }
    } else {
      setSelected([model.id]);
      props.onChange(model, event);
    }
  });

  const performActionAtFocusedIndex = useDynamicCallback((event: KeyboardEvent) => {
    if (isFocusedState(state)) {
      const item = availableItems[state.index];
      if (!isNil(item)) {
        if (isModelItem(item)) {
          onMenuItemClick(item.model, event);
        } else {
          if (!isNil(item.extra.onClick)) {
            item.extra.onClick(event);
          }
        }
      }
    }
  });

  const keyListener = useDynamicCallback((e: KeyboardEvent) => {
    if (e.code === "Enter" || e.code === "Tab") {
      performActionAtFocusedIndex(e);
    } else if (e.code === "ArrowDown") {
      e.stopPropagation();
      incrementFocusedIndex();
    } else if (e.code === "ArrowUp") {
      e.stopPropagation();
      decrementFocusedIndex();
    }
  });

  useImperativeHandle(
    props.menuRef,
    (): ModelMenuRef<M> => ({
      focused: state.focused,
      incrementFocusedIndex,
      decrementFocusedIndex,
      focus: (value: boolean) => {
        // If the state is just { focused: false }, the hook will set the specific
        // state depending on the props supplied to the menu.
        if (value === true && isUnfocusedState(state) && availableItems.length !== 0) {
          setState({ focused: true, index: 0 });
        } else if (value === false && isFocusedState(state)) {
          setState({ focused: false });
        }
      },
      getModelAtFocusedIndex: () => {
        if (isFocusedState(state)) {
          const modelItems: GenericModelItem<M>[] = filter(availableItems, (item: GenericItem<M>) =>
            isModelItem(item)
          ) as GenericModelItem<M>[];
          if (!isNil(modelItems[state.index])) {
            return modelItems[state.index].model;
          }
        }
        return null;
      },
      performActionAtFocusedIndex
    })
  );

  useEffect(() => {
    !isNil(props.onFocusCallback) && props.onFocusCallback(state.focused);
    if (state.focused === true) {
      window.addEventListener("keydown", keyListener);
      return () => window.removeEventListener("keydown", keyListener);
    }
  }, [state.focused]);

  /* eslint-disable indent */
  return (
    <RenderWithSpinner loading={props.loading} size={22}>
      <Menu.Menu
        className={classNames("model-menu", props.className)}
        id={!isNil(props.id) ? props.id : menuId}
        style={props.style}
      >
        <React.Fragment>
          <ModelMenuItems<M>
            menuId={menuId}
            models={map(topLevelModelItems, (item: GenericModelItem<M>) => item.model)}
            focusedIndex={isFocusedState(state) && !isNil(topLevelModelItems[state.index]) ? state.index : null}
            checkbox={isMultipleModelMenuProps(props) && props.checkbox === true}
            multiple={isMultipleModelMenuProps(props)}
            onPress={(m: M, e: SyntheticEvent) => onMenuItemClick(m, e)}
            selected={selected}
            renderItem={props.renderItem}
            levelIndent={props.levelIndent}
            itemProps={props.itemProps}
            indexMap={indexMap}
            highlightActive={props.highlightActive}
            leftAlign={props.leftAlign}
            hidden={props.hidden}
            visible={props.visible}
            bordersForLevels={props.bordersForLevels}
            level={0}
          />
          {map(availableExtraItems, (item: GenericExtraItem, index: number) => {
            return (
              <ExtraModelMenuItem
                key={index}
                {...item.extra}
                active={isFocusedState(state) && state.index === index + availableModelItems.length}
              />
            );
          })}
        </React.Fragment>
      </Menu.Menu>
    </RenderWithSpinner>
  );
};

export default ModelMenu;
