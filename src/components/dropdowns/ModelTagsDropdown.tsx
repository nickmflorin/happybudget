import { find, isNil, map, filter } from "lodash";
import classNames from "classnames";

import { Dropdown } from "antd";
import { DropDownProps } from "antd/lib/dropdown";

import { ModelTagsMenu } from "components/menus";
import { Tag } from "components/tagging";

import "./ModelTagsDropdown.scss";

type SingleModelTagsDropdownProps<M extends Model.Model, V extends number = number> = {
  onChange: (models: M) => void;
  multiple: false;
  value: V | null;
  selected?: number | null;
};

type MultipleModelTagsDropdownProps<M extends Model.Model, V extends number = number> = {
  onChange: (models: M[]) => void;
  multiple?: true;
  value: V[] | null;
  selected?: number[];
};

export type ModelTagsDropdownProps<M extends Model.Model, V extends number = number> = (
  | SingleModelTagsDropdownProps<M, V>
  | MultipleModelTagsDropdownProps<M, V>
) &
  Omit<DropDownProps, "trigger" | "className" | "overlay"> & {
    className?: string;
    trigger?: ("click" | "hover" | "contextMenu")[];
    tagProps?: TagProps<M>;
    models: M[];
    onMissing?: JSX.Element | EmptyTagProps;
    onNoData?: {
      onClick?: () => void;
      text: string;
      icon?: JSX.Element;
      defaultFocused?: boolean;
    };
  };

const ModelTagsDropdown = <M extends Model.Model, V extends number = number>(
  props: ModelTagsDropdownProps<M, V>
): JSX.Element => {
  const isMultiple = (
    data: SingleModelTagsDropdownProps<M> | MultipleModelTagsDropdownProps<M>
  ): data is MultipleModelTagsDropdownProps<M> => {
    return (data as MultipleModelTagsDropdownProps<M>).multiple === true;
  };

  const { onNoData, ...dropdownProps } = props;

  if (isMultiple(props)) {
    let selectedPresentModels: M[] = [];
    if (props.value !== null) {
      const selectedModels: (M | undefined)[] = map(props.value, (value: V) =>
        find(props.models, { id: value } as any)
      );
      selectedPresentModels = filter(selectedModels, (m: M | undefined) => m !== undefined) as M[];
    }
    return (
      <Dropdown
        {...dropdownProps}
        className={classNames("model-tags-dropdown", props.className)}
        trigger={props.trigger || ["click"]}
        overlay={
          <ModelTagsMenu<M>
            selected={props.selected}
            models={props.models}
            tagProps={props.tagProps}
            onChange={props.onChange}
            multiple={true}
            onNoData={onNoData}
          />
        }
      >
        <div className={"model-tags-dropdown-child"}>
          <Tag.Multiple<M>
            tagProps={props.tagProps}
            models={selectedPresentModels}
            onMissing={props.onMissing || { visible: false }}
          />
        </div>
      </Dropdown>
    );
  } else {
    const model = find(props.models, { id: props.value } as any);
    return (
      <Dropdown
        {...dropdownProps}
        className={classNames("model-tags-dropdown", props.className)}
        trigger={props.trigger || ["click"]}
        overlay={
          <ModelTagsMenu<M>
            selected={props.selected}
            models={props.models}
            tagProps={props.tagProps}
            onChange={props.onChange}
            multiple={false}
            onNoData={onNoData}
          />
        }
      >
        {isNil(model) ? (
          !isNil(props.onMissing) ? (
            Tag.emptyTagPropsOrComponent(props.onMissing)
          ) : (
            <Tag style={{ opacity: 0 }}>{"None"}</Tag>
          )
        ) : (
          <Tag model={model} {...props.tagProps} />
        )}
      </Dropdown>
    );
  }
};

export default ModelTagsDropdown;
