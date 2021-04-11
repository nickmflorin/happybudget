import { useMemo } from "react";
import { find, forEach, isNil, map } from "lodash";
import classNames from "classnames";

import { Dropdown } from "antd";
import { DropDownProps } from "antd/lib/dropdown";

import { ModelTagsMenu } from "components/menus";
import { Tag } from "components";
import { useDeepEqualMemo } from "lib/hooks";
import { getKeyValue } from "lib/util";

import "./ModelTagsDropdown.scss";

type SingleModelTagsDropdownProps<M extends Model, V extends number = number> = {
  onChange: (models: M) => void;
  multiple: false;
  value: V | null;
};

type MultipleModelTagsDropdownProps<M extends Model, V extends number = number> = {
  onChange: (models: M[]) => void;
  multiple?: true;
  value: V[] | null;
};

export type ModelTagsDropdownProps<M extends Model, V extends number = number> = (
  | SingleModelTagsDropdownProps<M, V>
  | MultipleModelTagsDropdownProps<M, V>
) &
  Omit<DropDownProps, "trigger" | "className" | "overlay"> & {
    className?: string;
    trigger?: ("click" | "hover" | "contextMenu")[];
    labelField: keyof M;
    models: M[];
    selected?: number | number[] | null;
  };

const ModelTagsDropdown = <M extends Model, V extends number = number>(
  props: ModelTagsDropdownProps<M, V>
): JSX.Element => {
  const mapping = useMemo((): { [key: number]: { label: string; model: M } } => {
    const mapper: { [key: number]: { label: string; model: M } } = {};
    if (!isNil(props.value)) {
      if (Array.isArray(props.value)) {
        forEach(props.value, (id: number) => {
          const model = find(props.models, { id } as any);
          if (!isNil(model)) {
            const label = getKeyValue<M, keyof M>(props.labelField)(model);
            if (typeof label === "string") {
              mapper[model.id] = { label, model };
            }
          }
        });
      } else {
        const model = find(props.models, { id: props.value } as any);
        if (!isNil(model)) {
          const label = getKeyValue<M, keyof M>(props.labelField)(model);
          if (typeof label === "string") {
            mapper[model.id] = { label, model };
          }
        }
      }
    }
    return mapper;
  }, [useDeepEqualMemo(props.value), useDeepEqualMemo(props.models), props.labelField]);

  const child = (value: V | V[] | null, i: number = 0): JSX.Element => {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return (
          <Tag key={i} uppercase style={{ opacity: 0 }}>
            {"None"}
          </Tag>
        );
      }
      return (
        <div className={"multiple-tags-wrapper"} key={i}>
          {map(value, (v: V, j: number) => child(v, i + j))}
        </div>
      );
    } else if (value !== null) {
      const mapped = mapping[value];
      if (!isNil(mapped)) {
        return (
          <Tag colorIndex={mapped.model.id} key={i} uppercase>
            {mapped.label}
          </Tag>
        );
      } else {
        return (
          <Tag key={i} uppercase style={{ opacity: 0 }}>
            {"None"}
          </Tag>
        );
      }
    } else {
      return (
        <Tag key={i} uppercase style={{ opacity: 0 }}>
          {"None"}
        </Tag>
      );
    }
  };

  const isMultiple = (
    data: SingleModelTagsDropdownProps<M> | MultipleModelTagsDropdownProps<M>
  ): data is MultipleModelTagsDropdownProps<M> => {
    return (data as MultipleModelTagsDropdownProps<M>).multiple === true;
  };

  if (isMultiple(props)) {
    return (
      <Dropdown
        {...props}
        className={classNames("model-tags-dropdown", props.className)}
        trigger={props.trigger || ["click"]}
        overlay={
          <ModelTagsMenu<M>
            selected={props.selected}
            models={props.models}
            labelField={props.labelField}
            onChange={props.onChange}
            multiple={true}
          />
        }
      >
        <div className={"model-tags-dropdown-child"}>{child(props.value)}</div>
      </Dropdown>
    );
  } else {
    return (
      <Dropdown
        {...props}
        className={classNames("model-tags-dropdown", props.className)}
        trigger={props.trigger || ["click"]}
        overlay={
          <ModelTagsMenu<M>
            selected={props.selected}
            models={props.models}
            labelField={props.labelField}
            onChange={props.onChange}
            multiple={false}
          />
        }
      >
        <div className={"model-tags-dropdown-child"}>{child(props.value)}</div>
      </Dropdown>
    );
  }
};

export default ModelTagsDropdown;
