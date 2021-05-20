import React, { useImperativeHandle, useEffect, useState, useMemo } from "react";
import { map, isNil, includes, filter, find } from "lodash";
import classNames from "classnames";
import { Menu, Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { RenderWithSpinner, ShowHide } from "components";
import { useDeepEqualMemo, useDebouncedJSSearch, useTrackFirstRender, useDynamicCallback } from "lib/hooks";
import {
  ModelMenuRef,
  ModelMenuItemProps,
  ModelMenuProps,
  isMultipleModelMenuProps,
  ModelMenuItemsProps
} from "./model";
import "./ModelMenu.scss";

const isModelWithChildren = <M extends Model.M>(model: M): model is M & { children: M[] } => {
  return (
    (model as M & { children: M[] }).children !== undefined && Array.isArray((model as M & { children: M[] }).children)
  );
};

export const ModelMenuItem = <M extends Model.M>(props: ModelMenuItemProps<M>): JSX.Element => {
  const { model, ...primary } = props;
  const {
    highlightActive,
    multiple,
    selected,
    hidden,
    visible,
    levelIndent,
    level,
    checkbox,
    focused,
    focusedIndex,
    indexMap,
    itemProps,
    onSelect,
    onDeselect,
    onClick,
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

  return (
    <ShowHide show={!(isVisible === false)}>
      <Menu.Item
        {...rest} // Required for Antd Menu Item
        {...itemProps}
        onClick={(info: any) => onClick(model)}
        className={classNames("model-menu-item", !isNil(itemProps) ? itemProps.className : "", {
          active: isActive,
          focus: focused === true && !isNil(focusedIndex) ? focusedIndex === indexMap[String(model.id)] : false
        })}
      >
        <div
          style={!isNil(levelIndent) ? { width: "100%", paddingLeft: levelIndent * (level - 1) } : { width: "100%" }}
        >
          {checkbox ? (
            <div style={{ display: "flex", width: "100%" }}>
              <Checkbox
                checked={includes(selected, model.id)}
                style={{ marginRight: 8 }}
                onChange={(e: CheckboxChangeEvent) => {
                  e.preventDefault();
                  if (e.target.checked) {
                    if (selected) {
                      /* eslint-disable no-console */
                      console.warn(`Inconsistent State: Model with ID ${model.id} already in selected state.`);
                    } else {
                      onSelect(model);
                    }
                  } else {
                    if (!selected) {
                      /* eslint-disable no-console */
                      console.warn(`Inconsistent State: Model with ID ${model.id} already in selected state.`);
                    } else {
                      onDeselect(model);
                    }
                  }
                }}
              />
              {renderItem(model, { level: level, index: indexMap[String(model.id)] })}
            </div>
          ) : (
            renderItem(model, { level: level, index: indexMap[String(model.id)] })
          )}
        </div>
      </Menu.Item>
      {isModelWithChildren(model) && model.children.length !== 0 && (
        <ModelMenuItems<M> {...primary} models={model.children} level={props.level + 1} />
      )}
    </ShowHide>
  );
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

const ModelMenu = <M extends Model.M>(props: ModelMenuProps<M>): JSX.Element => {
  const [focused, setFocused] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState<(number | string)[]>([]);
  const [emptyItemActive, setEmptyItemActive] = useState(false);
  const firstRender = useTrackFirstRender();

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

  const totalSpots = useMemo(() => {
    let total = 0;
    if (props.models.length !== 0) {
      if (topLevelModels.length !== 0 || isNil(props.noSearchResultsItem)) {
        total += models.length;
        if (!isNil(props.bottomItem)) {
          total += 1;
        }
      } else {
        total = 1;
      }
    } else if (!isNil(props.emptyItem)) {
      total = 1;
    }
    return total;
  }, [
    useDeepEqualMemo(models),
    useDeepEqualMemo(props.models),
    useDeepEqualMemo(topLevelModels),
    props.noSearchResultsItem,
    props.bottomItem,
    props.emptyItem
  ]);

  const indexMap = useMemo<{ [key: string]: number }>(() => {
    const mapping: { [key: string]: number } = {};
    map(models, (m: M, index: number) => {
      mapping[String(m.id)] = index;
    });
    return mapping;
  }, [useDeepEqualMemo(models)]);

  const focusAtIndex = (index: number) => {
    setFocused(true);
    setFocusedIndex(Math.max(Math.min(index, totalSpots - 1), 0));
  };

  const incrementFocusedIndex = () => {
    if (focusedIndex === null) {
      focusAtIndex(0);
    } else {
      focusAtIndex(focusedIndex + 1);
    }
  };

  const decrementFocusedIndex = () => {
    if (focusedIndex === null || focusedIndex === 0) {
      setFocused(false);
    } else {
      focusAtIndex(focusedIndex - 1);
    }
  };

  const onMenuItemClick = useDynamicCallback((model: M): void => {
    if (isMultipleModelMenuProps(props)) {
      const selectedModels = filter(
        map(selected, (id: number | string) => find(props.models, { id })),
        (m: M | undefined) => m !== undefined
      ) as M[];
      if (includes(selected, model.id)) {
        setSelected(filter(selected, (id: number | string) => id !== model.id));
        props.onChange(filter(selectedModels, (m: M) => m.id !== model.id));
      } else {
        setSelected([...selected, model.id]);
        props.onChange([...selectedModels, model]);
      }
    } else {
      setSelected([model.id]);
      props.onChange(model);
    }
  });

  const performActionAtFocusedIndex = useDynamicCallback(() => {
    console.log({ focused, focusedIndex });
    if (focused === true) {
      if (!isNil(focusedIndex)) {
        if (focusedIndex < models.length - 1) {
          const model = models[focusedIndex];
          if (!isNil(model)) {
            onMenuItemClick(model);
          }
        } else {
          if (props.models.length !== 0) {
            if (topLevelModels.length !== 0 || isNil(props.noSearchResultsItem)) {
              if (!isNil(props.bottomItem)) {
                !isNil(props.bottomItem?.onClick) && props.bottomItem?.onClick();
              }
            } else if (!isNil(props.noSearchResultsItem)) {
              !isNil(props.noSearchResultsItem.onClick) && props.noSearchResultsItem.onClick();
            }
          } else if (!isNil(props.emptyItem)) {
            !isNil(props.emptyItem.onClick) && props.emptyItem.onClick();
          }
        }
      }
    }
  });

  const keyListener = useDynamicCallback((e: KeyboardEvent) => {
    setFocused(true);
    if (e.code === "Enter") {
      performActionAtFocusedIndex();
    } else if (e.code === "ArrowDown") {
      e.stopPropagation();
      incrementFocusedIndex();
    } else if (e.code === "ArrowUp") {
      e.stopPropagation();
      decrementFocusedIndex();
    }
  });

  useEffect(() => {
    if (isNil(props.selected)) {
      setSelected([]);
    } else {
      setSelected(Array.isArray(props.selected) ? props.selected : [props.selected]);
    }
  }, [props.selected]);

  useEffect(() => {
    if (
      props.defaultFocusFirstItem === true &&
      firstRender === true &&
      models.length !== 0 &&
      (isNil(props.selected) || (Array.isArray(props.selected) && props.selected.length === 0))
    ) {
      setFocusedIndex(0);
      setFocused(true);
    }
  }, [props.defaultFocusFirstItem, useDeepEqualMemo(models), props.selected, firstRender]);

  useEffect(() => {
    if (emptyItemActive === true) {
      setFocusedIndex(null);
      setFocused(true);
    }
  }, [emptyItemActive]);

  useEffect(() => {
    !isNil(props.onFocusCallback) && props.onFocusCallback(focused);
    if (focused === false) {
      setFocusedIndex(null);
      setEmptyItemActive(false);
    }
  }, [focused]);

  useEffect(() => {
    if (focusedIndex !== null) {
      if (isNil(models[focusedIndex])) {
        setFocusedIndex(0);
      }
    }
  }, [useDeepEqualMemo(models)]);

  // If there is only one model that is visible, either from a search or from only
  // 1 model being present, we may want it to be active/selected by default.
  useEffect(() => {
    if (
      ((models.length === 1 && props.defaultFocusOnlyItem === true) ||
        (props.defaultFocusOnlyItemOnSearch && !isNil(props.search) && props.search !== "")) &&
      firstRender === false
    ) {
      setFocusedIndex(0);
      setFocused(true);
    }
  }, [useDeepEqualMemo(models), props.search, props.defaultFocusOnlyItemOnSearch, props.defaultFocusOnlyItem]);

  useEffect(() => {
    if (props.models.length === 0 && !isNil(props.emptyItem)) {
      setEmptyItemActive(true);
    }
  }, [useDeepEqualMemo(props.models)]);

  useEffect(() => {
    if (topLevelModels.length === 0 && !isNil(props.noSearchResultsItem)) {
      setEmptyItemActive(true);
    }
  }, [useDeepEqualMemo(topLevelModels)]);

  useImperativeHandle(
    props.menuRef,
    (): ModelMenuRef<M> => ({
      focused,
      focusedIndex,
      allowableFocusedIndexRange: models.length,
      incrementFocusedIndex,
      decrementFocusedIndex,
      focusAtIndex,
      focus: (value: boolean) => {
        setFocused(value);
      },
      getModelAtFocusedIndex: () => {
        if (!isNil(focusedIndex) && focused === true) {
          return models[focusedIndex] || null;
        }
        return null;
      },
      performActionAtFocusedIndex
    })
  );

  useEffect(() => {
    window.addEventListener("keydown", keyListener);
    return () => window.removeEventListener("keydown", keyListener);
  }, []);

  return (
    <RenderWithSpinner loading={props.loading} size={22}>
      <Menu className={classNames("model-menu", props.className)} style={props.style} id={props.id}>
        {props.models.length !== 0 ? (
          topLevelModels.length !== 0 || isNil(props.noSearchResultsItem) ? (
            <React.Fragment>
              <ModelMenuItems<M>
                models={topLevelModels}
                focused={focused}
                focusedIndex={focusedIndex}
                checkbox={isMultipleModelMenuProps(props) && props.checkbox === true}
                multiple={isMultipleModelMenuProps(props)}
                onClick={(m: M) => onMenuItemClick(m)}
                selected={selected}
                renderItem={props.renderItem}
                levelIndent={props.levelIndent}
                itemProps={props.itemProps}
                indexMap={indexMap}
                highlightActive={props.highlightActive}
                hidden={props.hidden}
                visible={props.visible}
                level={0}
                onSelect={(m: M) => {
                  if (isMultipleModelMenuProps(props)) {
                    const selectedModels = filter(
                      map(selected, (id: number | string) => find(models, { id })),
                      (mi: M | undefined) => mi !== undefined
                    ) as M[];
                    setSelected([...selected, m.id]);
                    props.onChange([...selectedModels, m]);
                  } else {
                    setSelected([m.id]);
                    props.onChange(m);
                  }
                }}
                onDeselect={(m: M) => {
                  if (isMultipleModelMenuProps(props)) {
                    const selectedModels = filter(
                      map(selected, (id: number | string) => find(models, { id })),
                      (mi: M | undefined) => mi !== undefined
                    ) as M[];
                    setSelected(filter(selected, (id: number | string) => id !== m.id));
                    props.onChange(filter(selectedModels, (mi: M) => mi.id !== m.id));
                  } else {
                    setSelected([m.id]);
                    props.onChange(m);
                  }
                }}
              />
              {!isNil(props.bottomItem) && (
                <Menu.Item
                  className={classNames("model-menu-item", "empty", { active: focusedIndex === totalSpots - 1 })}
                  onClick={() => !isNil(props.bottomItem?.onClick) && props.bottomItem?.onClick()}
                >
                  {!isNil(props.bottomItem.icon) && <div className={"icon-container"}>{props.bottomItem.icon}</div>}
                  {props.bottomItem.text}
                </Menu.Item>
              )}
            </React.Fragment>
          ) : (
            <Menu.Item
              className={classNames("model-menu-item", "empty", { active: focusedIndex === 1 })}
              onClick={() => !isNil(props.emptyItem?.onClick) && props.emptyItem?.onClick()}
            >
              {!isNil(props.noSearchResultsItem.icon) && (
                <div className={"icon-container"}>{props.noSearchResultsItem.icon}</div>
              )}
              {props.noSearchResultsItem.text}
            </Menu.Item>
          )
        ) : !isNil(props.emptyItem) ? (
          <Menu.Item
            className={classNames("model-menu-item", "empty", { active: focusedIndex === 1 })}
            onClick={() => !isNil(props.emptyItem?.onClick) && props.emptyItem?.onClick()}
          >
            {!isNil(props.emptyItem.icon) && <div className={"icon-container"}>{props.emptyItem.icon}</div>}
            {props.emptyItem.text}
          </Menu.Item>
        ) : (
          <></>
        )}
      </Menu>
    </RenderWithSpinner>
  );
};

export default ModelMenu;
