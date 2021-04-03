import React, { useState } from "react";
import { map, isNil, includes, filter, find } from "lodash";
import classNames from "classnames";
import { Menu } from "antd";
import { Tag } from "components/display";
import { getKeyValue } from "util/objects";

import "./ModelTagsMenu.scss";

type SingleModelTagsMenuProps<M extends Model> = {
  onChange: (models: M) => void;
  multiple: false;
};

type MultipleModelTagsMenuProps<M extends Model> = {
  onChange: (models: M[]) => void;
  multiple?: true;
};

export type ModelTagsMenuProps<M extends Model> = (SingleModelTagsMenuProps<M> | MultipleModelTagsMenuProps<M>) & {
  models: M[];
  labelField: keyof M;
  uppercase?: boolean;
  defaultSelected?: number | number[] | null;
  className?: string;
  style?: React.CSSProperties;
};

const ModelTagsMenu = <M extends Model>(props: ModelTagsMenuProps<M>): JSX.Element => {
  const [selected, setSelected] = useState<number[]>(
    !isNil(props.defaultSelected)
      ? Array.isArray(props.defaultSelected)
        ? props.defaultSelected
        : [props.defaultSelected]
      : []
  );

  const isMultiple = (
    data: SingleModelTagsMenuProps<M> | MultipleModelTagsMenuProps<M>
  ): data is MultipleModelTagsMenuProps<M> => {
    return (data as MultipleModelTagsMenuProps<M>).multiple === true;
  };

  return (
    <Menu className={classNames("model-tags-menu", props.className)} style={props.style}>
      {map(props.models, (model: M) => {
        const label = getKeyValue<M, keyof M>(props.labelField)(model);
        if (typeof label === "string") {
          return (
            <Menu.Item
              key={model.id}
              className={classNames("model-tags-menu-item", { active: includes(selected, model.id) })}
              onClick={(info: any) => {
                if (isMultiple(props)) {
                  const selectedModels = filter(
                    map(selected, (id: number) => find(props.models, { id })),
                    (m: M | undefined) => m !== undefined
                  ) as M[];
                  if (includes(selected, model.id)) {
                    setSelected(
                      map(
                        filter(selectedModels, (m: M) => m.id !== model.id),
                        (m: M) => m.id
                      )
                    );
                    props.onChange(filter(selectedModels, (m: M) => m.id !== model.id));
                  } else {
                    setSelected([...selected, model.id]);
                    props.onChange([...selectedModels, model]);
                  }
                } else {
                  setSelected([model.id]);
                  props.onChange(model);
                }
              }}
            >
              <Tag colorIndex={model.id} uppercase={props.uppercase}>
                {label}
              </Tag>
            </Menu.Item>
          );
        }
      })}
    </Menu>
  );
};

export default ModelTagsMenu;
