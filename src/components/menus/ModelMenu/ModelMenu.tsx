import React, { useImperativeHandle, useEffect, useState, useCallback, useMemo } from "react";
import { map, isNil, includes, filter, find } from "lodash";
import classNames from "classnames";
import { Menu, Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { RenderWithSpinner, ShowHide } from "components";
import { useDeepEqualMemo, useDebouncedJSSearch } from "lib/hooks";
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

  const topLevelModels = useMemo<M[]>(() => {
    const topLevelIds: (number | string)[] = map(props.models, (m: M) => m.id);
    return filter(models, (model: M) => includes(topLevelIds, model.id)) as M[];
  }, [useDeepEqualMemo(models)]);

  useEffect(() => {
    if (isNil(props.selected)) {
      setSelected([]);
    } else {
      setSelected(Array.isArray(props.selected) ? props.selected : [props.selected]);
    }
  }, [props.selected]);

  useEffect(() => {
    if (focusedIndex !== null) {
      if (isNil(models[focusedIndex])) {
        setFocusedIndex(0);
      }
    }
  }, [useDeepEqualMemo(models)]);

  useEffect(() => {
    if (models.length === 1) {
      setFocusedIndex(0);
      setFocused(true);
    }
  }, [useDeepEqualMemo(models)]);

  useEffect(() => {
    if (props.models.length === 0 && !isNil(props.emptyItem)) {
      setEmptyItemActive(true);
      setFocusedIndex(null);
      setFocused(true);
    }
  }, [useDeepEqualMemo(props.models)]);

  useEffect(() => {
    if (topLevelModels.length === 0 && !isNil(props.noSearchResultsItem)) {
      setEmptyItemActive(true);
      setFocusedIndex(null);
      setFocused(true);
    }
  }, [useDeepEqualMemo(topLevelModels)]);

  const focusAtIndex = (index: number) => {
    setFocused(true);
    if (models.length !== 0) {
      setEmptyItemActive(false);
      setFocusedIndex(Math.max(Math.min(index, models.length - 1), 0));
    }
  };

  useImperativeHandle(
    props.menuRef,
    (): ModelMenuRef<M> => ({
      focused,
      focusedIndex,
      allowableFocusedIndexRange: models.length,
      incrementFocusedIndex: () => {
        if (focusedIndex === null) {
          focusAtIndex(0);
        } else {
          focusAtIndex(focusedIndex + 1);
        }
      },
      decrementFocusedIndex: () => {
        if (focusedIndex === null || focusedIndex === 0) {
          setFocused(false);
          setFocusedIndex(null);
          setEmptyItemActive(false);
        } else {
          focusAtIndex(focusedIndex - 1);
        }
      },
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
      performActionAtFocusedIndex: () => {
        if (focused === true) {
          if (!isNil(focusedIndex)) {
            const model = models[focusedIndex];
            if (!isNil(model)) {
              onMenuItemClick(model);
            }
          } else {
            if (topLevelModels.length === 0 && !isNil(props.noSearchResultsItem)) {
              !isNil(props.noSearchResultsItem.onClick) && props.noSearchResultsItem.onClick();
            } else if (props.models.length === 0 && !isNil(props.emptyItem)) {
              !isNil(props.emptyItem.onClick) && props.emptyItem.onClick();
            }
          }
        }
      }
    })
  );

  const onMenuItemClick = (model: M): void => {
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
  };

  return (
    <RenderWithSpinner loading={props.loading} size={22}>
      <Menu className={classNames("model-menu", props.className)} style={props.style} id={props.id}>
        {props.models.length !== 0 ? (
          topLevelModels.length !== 0 || isNil(props.noSearchResultsItem) ? (
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
          ) : (
            <Menu.Item
              className={classNames("model-menu-item", "empty", { active: emptyItemActive })}
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
            className={classNames("model-menu-item", "empty", { active: emptyItemActive })}
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
