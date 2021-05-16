import React, { Ref, forwardRef, useImperativeHandle, useEffect, useState, useMemo } from "react";
import { map, isNil, includes, filter, find } from "lodash";
import classNames from "classnames";
import { Menu, Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { RenderWithSpinner } from "components";
import { useDeepEqualMemo, useDebouncedJSSearch } from "lib/hooks";
import { ModelMenuRef, ModelMenuItemProps, ModelMenuProps, isMultipleModelMenuProps, ModelItem } from "./model";
import "./ModelMenu.scss";

export const ModelMenuItem = <M extends Model.M>({
  focused,
  focusedIndex,
  baseIndex,
  checkbox,
  selected,
  model,
  level,
  levelIndent,
  onClick,
  onSelect,
  onDeselect,
  renderItem,
  isMenuItemActive,
  isMenuItemVisible,
  ...props
}: ModelMenuItemProps<M>): JSX.Element => {
  if (isMenuItemVisible(model) === false) {
    return <></>;
  }
  // NOTE: The level should be starting at 0, but for whatever reason it keeps starting
  // at 1.  We should figure out why that is.
  return (
    <React.Fragment>
      <Menu.Item
        {...props}
        className={classNames("model-menu-item", props.className, {
          active: isMenuItemActive(model),
          focus: focused === true && !isNil(focusedIndex) ? focusedIndex === baseIndex : false
        })}
        onClick={(info: any) => onClick(model)}
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
              {renderItem(model, { level, index: baseIndex })}
            </div>
          ) : (
            renderItem(model, { level, index: baseIndex })
          )}
        </div>
      </Menu.Item>
      {!isNil(model.children) &&
        model.children.length !== 0 &&
        map(model.children, (child: ModelItem<M>, index: number) => {
          return (
            <ModelMenuItem<M>
              key={child.id}
              model={child}
              checkbox={checkbox}
              focused={focused}
              focusedIndex={focusedIndex}
              baseIndex={baseIndex + index}
              level={level + 1}
              selected={selected}
              onClick={onClick}
              renderItem={renderItem}
              onSelect={onSelect}
              onDeselect={onDeselect}
              isMenuItemActive={isMenuItemActive}
              isMenuItemVisible={isMenuItemVisible}
              levelIndent={levelIndent}
              {...props}
            />
          );
        })}
    </React.Fragment>
  );
};

export const ModelMenu = <M extends Model.M>(props: ModelMenuProps<M>): JSX.Element => {
  const [focused, setFocused] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState<(number | string)[]>([]);

  // To get the indexing correct, what we do is we flatten all of the models out so that children
  // models are at the same level as their parents.  Then, when we loop over the flattened models
  // to create components, we only create the top level components if the model is a top level
  // model.  The component then recursively creates components for the children.  This ensures that
  // the indexing of the components is correct.
  const flattenedModels = useMemo(() => {
    const flattened: M[] = [];

    const addModel = (m: ModelItem<M>) => {
      if (!isNil(m.children)) {
        flattened.push(m);
        for (let i = 0; i < m.children.length; i++) {
          addModel(m.children[i]);
        }
      } else {
        flattened.push(m);
      }
    };
    map(props.models, (model: ModelItem<M>) => addModel(model));
    return flattened;
  }, [props.models]);

  const filteredModels = useDebouncedJSSearch<M>(props.search, flattenedModels, {
    indices: props.searchIndices || ["id"],
    disabled: props.clientSearching === false
  });

  useEffect(() => {
    if (isNil(props.selected)) {
      setSelected([]);
    } else {
      setSelected(Array.isArray(props.selected) ? props.selected : [props.selected]);
    }
  }, [props.selected]);

  useEffect(() => {
    if (focusedIndex !== null) {
      if (isNil(filteredModels[focusedIndex])) {
        setFocusedIndex(0);
      }
    }
  }, [useDeepEqualMemo(filteredModels)]);

  useEffect(() => {
    if (filteredModels.length === 1) {
      setFocusedIndex(0);
      setFocused(true);
    }
  }, [useDeepEqualMemo(filteredModels)]);

  useImperativeHandle(
    props.forwardedRef,
    (): ModelMenuRef<M> => ({
      focused,
      focusedIndex,
      allowableFocusedIndexRange: filteredModels.length,
      incrementFocusedIndex: () => {
        setFocusedIndex(isNil(focusedIndex) ? 0 : Math.min(focusedIndex + 1, filteredModels.length - 1));
      },
      decrementFocusedIndex: () => {
        setFocusedIndex(isNil(focusedIndex) ? 0 : Math.max(focusedIndex - 1, 0));
      },
      focusAtIndex: (index: number) => {
        setFocused(true);
        setFocusedIndex(Math.min(index, filteredModels.length - 1));
      },
      focus: (value: boolean) => {
        setFocused(value);
      },
      getModelAtFocusedIndex: () => {
        if (!isNil(focusedIndex)) {
          return filteredModels[focusedIndex] || null;
        }
        return null;
      },
      selectModelAtFocusedIndex: () => {
        if (!isNil(focusedIndex)) {
          const model = filteredModels[focusedIndex];
          if (!isNil(model)) {
            onMenuItemClick(model);
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

  const isMenuItemActive = (model: M) => {
    if (includes(selected, model.id)) {
      if (isMultipleModelMenuProps(props) && props.checkbox === true) {
        // If we are operating with checkboxes, the highlightActive property needs to be explicitly
        // set.
        return props.highlightActive === true;
      }
      return props.highlightActive !== false;
    }
    return false;
  };

  const isMenuItemVisible = (model: M) => {
    if (!isNil(props.hidden)) {
      if (includes(props.hidden, model.id)) {
        return false;
      } else if (!isNil(props.visible) && !includes(props.visible, model.id)) {
        return false;
      }
      return true;
    } else if (!isNil(props.visible)) {
      return includes(props.visible, model.id);
    } else {
      return true;
    }
  };

  return (
    <RenderWithSpinner loading={props.loading} size={22}>
      <Menu className={classNames("model-menu", props.className)} style={props.style} id={props.id}>
        {props.models.length !== 0 ? (
          // To get the indexing correct, what we do is we flatten all of the models out so that children
          // models are at the same level as their parents.  Then, when we loop over the flattened models
          // to create components, we only create the top level components if the model is a top level
          // model.  The component then recursively creates components for the children.  This ensures that
          // the indexing of the components is correct.
          map(filteredModels, (model: M, index: number) => {
            // Check to see if the model is a top level model and only render the component if it
            // is.  The subsequent level models will be rendered recursively by the ModelMenuItem
            // component.
            if (
              includes(
                map(props.models, (m: ModelItem<M>) => m.id),
                model.id
              )
            ) {
              return (
                <ModelMenuItem<M>
                  key={model.id}
                  model={model}
                  baseIndex={index}
                  focused={focused}
                  focusedIndex={focusedIndex}
                  level={0}
                  isMenuItemActive={isMenuItemActive}
                  isMenuItemVisible={isMenuItemVisible}
                  checkbox={isMultipleModelMenuProps(props) && props.checkbox === true}
                  // This callback might be being used for the recursive children, so it might not necessarily
                  // equal the `model`.
                  onClick={(m: M) => onMenuItemClick(m)}
                  selected={selected}
                  renderItem={props.renderItem}
                  levelIndent={props.levelIndent}
                  // This callback might be being used for the recursive children, so it might not necessarily
                  // equal the `model`.
                  onSelect={(m: M) => {
                    if (isMultipleModelMenuProps(props)) {
                      const selectedModels = filter(
                        map(selected, (id: number | string) => find(flattenedModels, { id })),
                        (mi: M | undefined) => mi !== undefined
                      ) as M[];
                      setSelected([...selected, model.id]);
                      props.onChange([...selectedModels, model]);
                    } else {
                      setSelected([model.id]);
                      props.onChange(model);
                    }
                  }}
                  // This callback might be being used for the recursive children, so it might not necessarily
                  // equal the `model`.
                  onDeselect={() => {
                    if (isMultipleModelMenuProps(props)) {
                      const selectedModels = filter(
                        map(selected, (id: number | string) => find(flattenedModels, { id })),
                        (mi: M | undefined) => mi !== undefined
                      ) as M[];
                      setSelected(filter(selected, (id: number | string) => id !== model.id));
                      props.onChange(filter(selectedModels, (m: M) => m.id !== model.id));
                    } else {
                      setSelected([model.id]);
                      props.onChange(model);
                    }
                  }}
                  {...props.itemProps}
                />
              );
            } else {
              return <></>;
            }
          })
        ) : !isNil(props.emptyItem) ? (
          <Menu.Item
            className={classNames("model-menu-item", "empty")}
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

export const TypeAgnosticModelMenu = forwardRef((props: ModelMenuProps<any>, ref?: Ref<ModelMenuRef<any>>) => (
  <ModelMenu<any> {...props} forwardedRef={ref} />
));

const createModelMenu = <M extends ModelItem>() => {
  return forwardRef((props: ModelMenuProps<M>, ref?: Ref<ModelMenuRef<M>>) => (
    <ModelMenu<M> {...props} forwardedRef={ref} />
  ));
};

export default createModelMenu;
