import React, { useImperativeHandle, useEffect, useState, useMemo, SyntheticEvent } from "react";
import { map, isNil, includes, filter, find, forEach, uniqueId } from "lodash";
import classNames from "classnames";
import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { RenderWithSpinner, VerticalFlexCenter, Menu } from "components";
import { useDeepEqualMemo, useDebouncedJSSearch, useTrackFirstRender, useDynamicCallback } from "lib/hooks";
import "./ModelMenu.scss";

const isMultipleModelMenuProps = <M extends Model.M>(
  data: ModelMenuProps<M>
): data is MultipleModelMenuProps<M> & _ModelMenuProps<M> => {
  return (data as MultipleModelMenuProps<M> & _ModelMenuProps<M>).multiple === true;
};

const isModelWithChildren = <M extends Model.M>(model: M): model is M & { children: M[] } => {
  return (
    (model as M & { children: M[] }).children !== undefined && Array.isArray((model as M & { children: M[] }).children)
  );
};

export const ModelMenuItem = <M extends Model.M>(props: ModelMenuItemProps<M>): JSX.Element => {
  const { model, ...primary } = props;
  const {
    menuId,
    highlightActive,
    multiple,
    selected,
    hidden,
    visible,
    levelIndent,
    level,
    checkbox,
    focusedIndex,
    indexMap,
    itemProps,
    leftAlign,
    bordersForLevels,
    onSelect,
    onDeselect,
    onPress,
    renderItem,
    ...rest
  } = primary;

  const isActive = useMemo(() => {
    if (includes(selected, model.id)) {
      if (multiple === true && checkbox === true) {
        // If we are operating with checkboxes, the highlightActive property
        // needs to be explicitly set.
        return highlightActive === true;
      }
      return highlightActive !== false;
    }
    return false;
  }, [highlightActive, multiple, selected, model]);

  const isVisible = useMemo(() => {
    if (!isNil(hidden)) {
      if (includes(hidden, model.id)) {
        return false;
      } else if (!isNil(visible) && !includes(visible, model.id)) {
        return false;
      }
      return true;
    } else if (!isNil(visible)) {
      return includes(visible, model.id);
    } else {
      return true;
    }
  }, [visible, hidden, model]);

  if (!isVisible === false) {
    return (
      <React.Fragment>
        <Menu.MenuItem
          {...rest} // Required for Antd Menu Item
          {...itemProps}
          key={model.id}
          id={`model-menu-${menuId}-item-${model.id}`}
          onClick={(e: React.MouseEvent<HTMLLIElement>) => onPress(model, e)}
          className={classNames("model-menu-item", !isNil(itemProps) ? itemProps.className : "", {
            active: isActive,
            focus: !isNil(focusedIndex) ? focusedIndex === indexMap[String(model.id)] : false,
            "left-align": leftAlign === true
          })}
          style={{
            ...(!isNil(itemProps) ? itemProps.style : {}),
            ...(!isNil(levelIndent) ? { paddingLeft: 10 + levelIndent * level } : { paddingLeft: 10 }),
            borderTop: level === 0 && bordersForLevels === true ? "1px solid #EFEFEF" : "none",
            paddingTop: level === 0 ? 4 : 2,
            paddingBottom: level === 0 ? 4 : 2,
            height: level === 0 ? "32px" : "28px"
          }}
        >
          {checkbox ? (
            <div className={"with-checkbox-wrapper"}>
              <Checkbox
                checked={includes(selected, model.id)}
                onChange={(e: CheckboxChangeEvent) => {
                  e.preventDefault();
                  if (e.target.checked) {
                    if (selected) {
                      /* eslint-disable no-console */
                      console.warn(`Inconsistent State: Model with ID ${model.id} already in selected state.`);
                    } else {
                      onSelect(model, e);
                    }
                  } else {
                    if (!selected) {
                      /* eslint-disable no-console */
                      console.warn(`Inconsistent State: Model with ID ${model.id} already in selected state.`);
                    } else {
                      onDeselect(model, e);
                    }
                  }
                }}
              />
              <VerticalFlexCenter>
                {renderItem(model, { level: level, index: indexMap[String(model.id)] })}
              </VerticalFlexCenter>
            </div>
          ) : (
            <VerticalFlexCenter>
              {renderItem(model, { level: level, index: indexMap[String(model.id)] })}
            </VerticalFlexCenter>
          )}
        </Menu.MenuItem>
        {isModelWithChildren(model) && model.children.length !== 0 && (
          <ModelMenuItems<M> {...primary} models={model.children} level={props.level + 1} />
        )}
      </React.Fragment>
    );
  }
  return <></>;
};

const ModelMenuItems = <M extends Model.M>(props: ModelMenuItemsProps<M>): JSX.Element => {
  const { models, ...rest } = props;
  return (
    <React.Fragment>
      {map(models, (model: M) => {
        return <ModelMenuItem<M> key={model.id} model={model} {...rest} />;
      })}
    </React.Fragment>
  );
};

type UnfocusedState = {
  readonly focused: false;
};

type FocusedState = {
  readonly focused: true;
};

type ModelIndexFocusedState = FocusedState & {
  readonly index: number;
};

type NoItemsState = {
  readonly noItems: true;
};

type NoItemsUnfocusedState = NoItemsState & UnfocusedState;

type NoItemsFocusedState = NoItemsState &
  FocusedState & {
    readonly noItemsActive: boolean;
  };

type BottomItemFocusedState = FocusedState & {
  readonly bottomItemActive: true;
};

type NoSearchResultsState = {
  readonly noSearchResults: true;
};

type NoSearchResultsUnfocusedState = NoSearchResultsState & UnfocusedState;

type NoSearchResultsFocusedState = NoSearchResultsState &
  FocusedState & {
    readonly noSearchResultsActive: boolean;
  };

type MenuFocusedState =
  | ModelIndexFocusedState
  | NoItemsFocusedState
  | BottomItemFocusedState
  | NoSearchResultsFocusedState;
type MenuUnfocusedState = UnfocusedState | NoItemsUnfocusedState | NoSearchResultsUnfocusedState;

type MenuState = MenuFocusedState | MenuUnfocusedState;

const isFocusedState = (state: MenuState): state is MenuFocusedState => {
  return (state as MenuFocusedState).focused === true;
};

const isUnfocusedState = (state: MenuState): state is MenuUnfocusedState => {
  return (state as MenuUnfocusedState).focused === false;
};

const isModelIndexFocusedState = (state: MenuState): state is ModelIndexFocusedState => {
  return isFocusedState(state) && (state as ModelIndexFocusedState).index !== undefined;
};

const isNoItemsFocusedState = (state: MenuState): state is NoItemsFocusedState => {
  return isFocusedState(state) && (state as NoItemsFocusedState).noItems === true;
};

const isNoItemsUnfocusedState = (state: MenuState): state is NoItemsUnfocusedState => {
  return isUnfocusedState(state) && (state as NoItemsUnfocusedState).noItems === true;
};

const isBottomItemFocusedState = (state: MenuState): state is BottomItemFocusedState => {
  return isFocusedState(state) && (state as BottomItemFocusedState).bottomItemActive === true;
};

const isNoSearchResultsFocusedState = (state: MenuState): state is NoSearchResultsFocusedState => {
  return isFocusedState(state) && (state as NoSearchResultsFocusedState).noSearchResults === true;
};

const isNoSearchResultsUnfocusedState = (state: MenuState): state is NoSearchResultsUnfocusedState => {
  return isUnfocusedState(state) && (state as NoSearchResultsUnfocusedState).noSearchResults === true;
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

  const topLevelModels = useMemo<M[]>(() => {
    const topLevelIds: (number | string)[] = map(props.models, (m: M) => m.id);
    return filter(models, (model: M) => includes(topLevelIds, model.id)) as M[];
  }, [useDeepEqualMemo(models)]);

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

  const setIndexFromSelectedState = (selectedState: (number | string)[]) => {
    if (selectedState.length !== 0) {
      let validSelectedModel: M | null = null;
      // TODO: In the case that there are multiple selected models (i.e. the Menu
      // is operating as multiple = true) we should see if there is a way to recover
      // the last active selection instead of defaulting to the first selected model
      // in the array.
      forEach(selectedState, (id: number | string) => {
        const m = find(models, { id } as any);
        // It might be the case that the selected model does not exist in the
        // models, beacuse the models are filtered based on the search and the
        // search might exclude the selection.
        if (!isNil(m)) {
          validSelectedModel = m;
          return false;
        }
      });
      if (validSelectedModel !== null) {
        const index = models.indexOf(validSelectedModel);
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
      if (props.models.length === 0) {
        if (!isNil(props.onNoData) && props.onNoData.defaultFocus === true) {
          setState({ focused: true, noItems: true, noItemsActive: true });
        } else {
          setState({ focused: true, noItems: true, noItemsActive: false });
        }
      } else if (models.length === 0) {
        if (!isNil(props.onNoSearchResults) && props.onNoSearchResults.defaultFocus === true) {
          setState({ focused: true, noSearchResults: true, noSearchResultsActive: true });
        } else {
          setState({ focused: true, noSearchResults: true, noSearchResultsActive: false });
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
              const index = models.indexOf(firstModel);
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
  }, [props.models, models, props.search]);

  useEffect(() => {
    if (isModelIndexFocusedState(state)) {
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
    if (isFocusedState(state) || props.autoFocus === true) {
      if (isModelIndexFocusedState(state)) {
        if (state.index + 1 < models.length) {
          setState({ focused: true, index: state.index + 1 });
        } else {
          if (!isNil(props.bottomItem)) {
            setState({ focused: true, bottomItemActive: true });
          }
        }
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
    if (isFocusedState(state) || props.autoFocus === true) {
      if (isNoItemsFocusedState(state) && state.noItemsActive === true) {
        setState({ ...state, focused: false, noItemsActive: false });
      } else if (isNoSearchResultsFocusedState(state) && state.noSearchResultsActive === true) {
        setState({ ...state, focused: false, noSearchResultsActive: false });
      } else if (isBottomItemFocusedState(state)) {
        if (models.length !== 0) {
          setState({ focused: true, index: models.length - 1 });
        } else {
          setState({ focused: false });
        }
      } else if (isModelIndexFocusedState(state)) {
        if (state.index > 0) {
          setState({ ...state, index: state.index - 1 });
        } else {
          setState({ focused: false });
        }
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
    if (isFocusedState(state) || props.autoFocus === true) {
      if (isModelIndexFocusedState(state)) {
        const model = models[state.index];
        if (!isNil(model)) {
          onMenuItemClick(model, event);
        }
      } else if (isNoItemsFocusedState(state) && state.noItemsActive === true) {
        if (!isNil(props.onNoData) && !isNil(props.onNoData.onClick)) {
          props.onNoData.onClick(event);
        }
      } else if (isNoSearchResultsFocusedState(state) && state.noSearchResultsActive === true) {
        if (!isNil(props.onNoSearchResults) && !isNil(props.onNoSearchResults.onClick)) {
          props.onNoSearchResults.onClick(event);
        }
      } else if (isBottomItemFocusedState(state)) {
        if (!isNil(props.bottomItem) && !isNil(props.bottomItem.onClick)) {
          props.bottomItem.onClick(event);
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
        if (value === true && isUnfocusedState(state)) {
          if (isNoItemsUnfocusedState(state)) {
            setState({ focused: true, bottomItemActive: true });
          } else if (isNoSearchResultsUnfocusedState(state)) {
            setState({ focused: true, noSearchResults: true, noSearchResultsActive: true });
          } else {
            setState({ focused: true, index: 0 });
          }
        } else if (value === false && isFocusedState(state)) {
          setState({ focused: false });
        }
      },
      getModelAtFocusedIndex: () => {
        if (isModelIndexFocusedState(state)) {
          return models[state.index] || null;
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
        {topLevelModels.length !== 0 &&
          (isUnfocusedState(state) || isModelIndexFocusedState(state) || isBottomItemFocusedState(state)) && (
            <React.Fragment>
              <ModelMenuItems<M>
                menuId={menuId}
                models={topLevelModels}
                focusedIndex={isModelIndexFocusedState(state) ? state.index : null}
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
                onSelect={(m: M, e: CheckboxChangeEvent) => {
                  if (isMultipleModelMenuProps(props)) {
                    const selectedModels = filter(
                      map(selected, (id: number | string) => find(models, { id })),
                      (mi: M | undefined) => mi !== undefined
                    ) as M[];
                    setSelected([...selected, m.id]);
                    props.onChange([...selectedModels, m], e);
                  } else {
                    setSelected([m.id]);
                    props.onChange(m, e);
                  }
                }}
                onDeselect={(m: M, e: CheckboxChangeEvent) => {
                  if (isMultipleModelMenuProps(props)) {
                    const selectedModels = filter(
                      map(selected, (id: number | string) => find(models, { id })),
                      (mi: M | undefined) => mi !== undefined
                    ) as M[];
                    setSelected(filter(selected, (id: number | string) => id !== m.id));
                    props.onChange(
                      filter(selectedModels, (mi: M) => mi.id !== m.id),
                      e
                    );
                  } else {
                    setSelected([m.id]);
                    props.onChange(m, e);
                  }
                }}
              />
              {!isNil(props.bottomItem) && (
                <Menu.MenuItem
                  className={classNames("model-menu-item", "model-menu-item--empty", {
                    active: isBottomItemFocusedState(state)
                  })}
                  onClick={(e: React.MouseEvent<HTMLLIElement>) =>
                    !isNil(props.bottomItem?.onClick) && props.bottomItem?.onClick(e)
                  }
                >
                  {!isNil(props.bottomItem.icon) && <div className={"icon-container"}>{props.bottomItem.icon}</div>}
                  {props.bottomItem.text}
                </Menu.MenuItem>
              )}
            </React.Fragment>
          )}
        {(isNoSearchResultsFocusedState(state) || isNoSearchResultsUnfocusedState(state)) &&
          /* eslint-disable indent */
          !isNil(props.onNoSearchResults) && (
            <Menu.MenuItem
              className={classNames("model-menu-item", "model-menu-item--empty", {
                active: isNoSearchResultsFocusedState(state) && state.noSearchResultsActive === true
              })}
              onClick={(e: React.MouseEvent<HTMLLIElement>) =>
                !isNil(props.onNoSearchResults?.onClick) && props.onNoSearchResults?.onClick(e)
              }
            >
              {!isNil(props.onNoSearchResults.icon) && (
                <div className={"icon-container"}>{props.onNoSearchResults.icon}</div>
              )}
              {props.onNoSearchResults.text}
            </Menu.MenuItem>
          )}
        {(isNoItemsFocusedState(state) || isNoItemsUnfocusedState(state)) && !isNil(props.onNoData) && (
          <Menu.MenuItem
            className={classNames("model-menu-item", "model-menu-item--empty", {
              active: isNoItemsFocusedState(state) && state.noItemsActive === true
            })}
            onClick={(e: React.MouseEvent<HTMLLIElement>) =>
              !isNil(props.onNoData?.onClick) && props.onNoData?.onClick(e)
            }
          >
            {!isNil(props.onNoData.icon) && <div className={"icon-container"}>{props.onNoData.icon}</div>}
            {props.onNoData.text}
          </Menu.MenuItem>
        )}
      </Menu.Menu>
    </RenderWithSpinner>
  );
};

export default ModelMenu;
