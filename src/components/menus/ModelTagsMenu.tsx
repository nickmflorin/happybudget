import { Ref, forwardRef, useImperativeHandle, useEffect, useState } from "react";
import { map, isNil, includes, filter, find } from "lodash";
import classNames from "classnames";
import { Menu, Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { Tag } from "components/tagging";
import { useDeepEqualMemo, useDebouncedJSSearch } from "lib/hooks";

import "./ModelTagsMenu.scss";

export type ModelTagsMenuRef<T extends Model.Model = Model.Model> = {
  readonly incrementFocusedIndex: () => void;
  readonly decrementFocusedIndex: () => void;
  readonly focus: (value: boolean) => void;
  readonly focusAtIndex: (index: number) => void;
  readonly getModelAtFocusedIndex: () => T | null;
  readonly selectModelAtFocusedIndex: () => void;
  readonly focused: boolean;
  readonly focusedIndex: number | null;
  readonly allowableFocusedIndexRange: number;
};

interface _ModelTagsMenuProps<M extends Model.Model = Model.Model> extends StandardComponentProps {
  readonly models: M[];
  readonly modelTextField?: keyof M;
  readonly modelColorField?: keyof M;
  readonly uppercase?: boolean;
  readonly selected?: number | number[] | null;
  readonly search?: string;
  readonly fillWidth?: boolean;
  readonly tagProps?: any;
  readonly itemProps?: any;
  readonly forwardedRef?: Ref<ModelTagsMenuRef<M>>;
  readonly highlightActive?: boolean;
  readonly emptyItem?: {
    readonly onClick?: () => void;
    readonly text: string;
    readonly icon?: JSX.Element;
  };
}

export interface SingleModelTagsMenuProps<M extends Model.Model = Model.Model> extends _ModelTagsMenuProps<M> {
  readonly onChange: (models: M) => void;
  readonly multiple?: false;
}

export interface MultipleModelTagsMenuProps<M extends Model.Model = Model.Model> extends _ModelTagsMenuProps<M> {
  readonly onChange: (models: M[]) => void;
  readonly multiple: true;
  readonly checkbox?: boolean;
}

export type ModelTagsMenuProps<M extends Model.Model> = SingleModelTagsMenuProps<M> | MultipleModelTagsMenuProps<M>;

const ModelTagsMenu = <M extends Model.Model = Model.Model>(props: ModelTagsMenuProps<M>): JSX.Element => {
  const [focused, setFocused] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const filteredModels = useDebouncedJSSearch<M>(props.search, props.models, {
    indices: ["name"]
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

  const isMultiple = (
    data: SingleModelTagsMenuProps<M> | MultipleModelTagsMenuProps<M>
  ): data is MultipleModelTagsMenuProps<M> => {
    return (data as MultipleModelTagsMenuProps<M>).multiple === true;
  };

  useImperativeHandle(
    props.forwardedRef,
    (): ModelTagsMenuRef<M> => ({
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
    if (isMultiple(props)) {
      const selectedModels = filter(
        map(selected, (id: number) => find(props.models, { id })),
        (m: M | undefined) => m !== undefined
      ) as M[];
      if (includes(selected, model.id)) {
        setSelected(filter(selected, (id: number) => id !== model.id));
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
      if (isMultiple(props) && props.checkbox === true) {
        // If we are operating with checkboxes, the highlightActive property needs to be explicitly
        // set.
        return props.highlightActive === true;
      }
      return props.highlightActive !== false;
    }
    return false;
  };

  return (
    <Menu className={classNames("model-tags-menu", props.className)} style={props.style} id={props.id}>
      {props.models.length !== 0 ? (
        map(filteredModels, (model: M, index: number) => {
          return (
            <Menu.Item
              key={model.id}
              className={classNames("model-tags-menu-item", {
                active: isMenuItemActive(model),
                focus: focused === true && !isNil(focusedIndex) ? focusedIndex === index : false
              })}
              onClick={(info: any) => onMenuItemClick(model)}
              {...props.itemProps}
            >
              {isMultiple(props) && props.checkbox === true ? (
                <div style={{ display: "flex", width: "100%" }}>
                  <Checkbox
                    checked={includes(selected, model.id)}
                    style={{ marginRight: 8 }}
                    onChange={(e: CheckboxChangeEvent) => {
                      const selectedModels = filter(
                        map(selected, (id: number) => find(props.models, { id })),
                        (m: M | undefined) => m !== undefined
                      ) as M[];
                      if (e.target.checked) {
                        if (!includes(selected, model.id)) {
                          /* eslint-disable no-console */
                          console.warn(`Inconsistent State: Model with ID ${model.id} already in selected state.`);
                        } else {
                          setSelected(filter(selected, (id: number) => id !== model.id));
                          props.onChange(filter(selectedModels, (m: M) => m.id !== model.id));
                        }
                      } else {
                        if (includes(selected, model.id)) {
                          /* eslint-disable no-console */
                          console.warn(`Inconsistent State: Model with ID ${model.id} already in deselected state.`);
                        } else {
                          setSelected([...selected, model.id]);
                          props.onChange([...selectedModels, model]);
                        }
                      }
                    }}
                  />
                  <Tag
                    model={model}
                    uppercase={props.uppercase}
                    modelTextField={props.modelTextField}
                    modelColorField={props.modelColorField}
                    fillWidth={props.fillWidth}
                    {...props.tagProps}
                  />
                </div>
              ) : (
                <Tag
                  model={model}
                  uppercase={props.uppercase}
                  modelTextField={props.modelTextField}
                  modelColorField={props.modelColorField}
                  fillWidth={props.fillWidth}
                  {...props.tagProps}
                />
              )}
            </Menu.Item>
          );
        })
      ) : !isNil(props.emptyItem) ? (
        <Menu.Item
          className={classNames("model-tags-menu-item", "empty")}
          onClick={() => !isNil(props.emptyItem?.onClick) && props.emptyItem?.onClick()}
        >
          {!isNil(props.emptyItem.icon) && <div className={"icon-container"}>{props.emptyItem.icon}</div>}
          {props.emptyItem.text}
        </Menu.Item>
      ) : (
        <></>
      )}
    </Menu>
  );
};

const createModelTagsMenu = <M extends Model.Model>() => {
  return forwardRef((props: ModelTagsMenuProps<M>, ref?: Ref<ModelTagsMenuRef<M>>) => (
    <ModelTagsMenu<M> {...props} forwardedRef={ref} />
  ));
};

export default createModelTagsMenu;
