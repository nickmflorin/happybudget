import React from "react";
import { isNil, map } from "lodash";

import { Spinner, Icon } from "components";
import { IconButton } from "components/buttons";
import { Select } from "components/fields";

import "./HeaderTemplateSelect.scss";

interface HeaderTemplateSelectProps {
  readonly value: Model.HeaderTemplate | null;
  readonly templates: Model.HeaderTemplate[];
  readonly loading: boolean;
  readonly deleting: ID | null;
  readonly onClear: () => void;
  readonly onLoad: (id: ID) => void;
  readonly onDelete: (id: ID) => void;
}

const HeaderTemplateSelect = (props: HeaderTemplateSelectProps): JSX.Element => {
  return (
    <Select
      className={"header-template-select"}
      showArrow
      loading={props.loading}
      disabled={props.loading}
      value={!isNil(props.value) ? (props.value.id as number) : "none"}
      onChange={(value: number | "none") => {
        if (typeof value === "number") {
          props.onLoad(value);
        } else {
          props.onClear();
        }
      }}
    >
      <React.Fragment>
        <Select.Option key={0} value={"none"}>
          {"Untitled"}
        </Select.Option>
        {map(props.templates, (template: Model.HeaderTemplate, index: number) => {
          return (
            <Select.Option className={"header-template-select-option"} key={index + 1} value={template.id}>
              <div className={"header-template-select-option-text"}>{template.name}</div>
              <div className={"header-template-select-option-icon-wrapper"}>
                {template.id === props.deleting ? (
                  <Spinner />
                ) : !isNil(props.deleting) ? (
                  <></>
                ) : (
                  <IconButton
                    icon={<Icon icon={"trash"} weight={"regular"} />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                      event.stopPropagation();
                      event.preventDefault();
                      props.onDelete(template.id);
                    }}
                  />
                )}
              </div>
            </Select.Option>
          );
        })}
      </React.Fragment>
    </Select>
  );
};

export default HeaderTemplateSelect;
