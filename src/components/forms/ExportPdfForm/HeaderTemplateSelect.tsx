import React from "react";
import { isNil, map } from "lodash";

import { Select } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/pro-regular-svg-icons";

import { Spinner } from "components";
import { IconButton } from "components/buttons";

import "./HeaderTemplateSelect.scss";

interface HeaderTemplateSelectProps {
  readonly value: Model.HeaderTemplate | null;
  readonly templates: Model.HeaderTemplate[];
  readonly loading: boolean;
  readonly deleting: number | null;
  readonly onClear: () => void;
  readonly onLoad: (id: number) => void;
  readonly onDelete: (id: number) => void;
}

const HeaderTemplateSelect = (props: HeaderTemplateSelectProps): JSX.Element => {
  return (
    <Select
      className={"header-template-select"}
      showArrow
      loading={props.loading}
      disabled={props.loading}
      value={!isNil(props.value) ? props.value.id : "none"}
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
                    icon={<FontAwesomeIcon className={"icon"} icon={faTrash} />}
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
