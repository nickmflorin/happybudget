import React from "react";
import classNames from "classnames";
import { map, isNil, find } from "lodash";
import { Tag } from "antd";

import { Icon } from "components";
import { Color } from "components/tagging";
import Select, { SelectProps } from "./Select";

// Does not seem to be exportable from AntD/RCSelect so we just copy it here.
type CustomTagProps = {
  readonly label: React.ReactNode;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly value: any;
  readonly disabled: boolean;
  readonly onClose: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  readonly closable: boolean;
};

export interface GroupSelectProps extends SelectProps<number> {
  readonly groups: Model.Group[];
}

const GroupSelect = (props: GroupSelectProps): JSX.Element => (
  <Select
    suffixIcon={<Icon icon={"caret-down"} weight={"solid"} />}
    {...props}
    className={classNames("select--group", props.className)}
    mode={"multiple"}
    showArrow
    tagRender={(params: CustomTagProps) => {
      const group = find(props.groups, { id: params.value });
      if (!isNil(group)) {
        return (
          <Tag className={"group-select-tag"} style={{ marginRight: 3 }} {...params}>
            <div className={"icon-wrapper"}>
              <Color size={16} color={group.color} />
            </div>
            {group.name}
          </Tag>
        );
      }
      return <></>;
    }}
  >
    {map(props.groups, (group: Model.Group, index: number) => {
      return (
        <Select.Option className={"group-select-option"} key={index + 1} value={group.id}>
          <div className={"icon-wrapper"}>
            <Color size={16} color={group.color} style={{ marginRight: 6 }} />
          </div>
          {group.name}
        </Select.Option>
      );
    })}
  </Select>
);

export default GroupSelect;
