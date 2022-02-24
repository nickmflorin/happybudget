import React from "react";
import classNames from "classnames";
import { map, isNil, find } from "lodash";
import { Tag } from "antd";

import { tabling, ui } from "lib";
import { Icon } from "components";
import Select, { SelectProps } from "./Select";

// Does not seem to be exportable from AntD/RCSelect so we just copy it here.
type Key = string | number;
type RawValueType = string | number;

interface LabelValueType {
  key?: Key;
  value?: RawValueType;
  label?: React.ReactNode;
  isCacheable?: boolean;
}

type DefaultValueType = RawValueType | RawValueType[] | LabelValueType | LabelValueType[];

type CustomTagProps = {
  label: React.ReactNode;
  value: DefaultValueType;
  disabled: boolean;
  onClose: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  closable: boolean;
};

export interface ColumnSelectProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.DataColumn<R, M> = Table.DataColumn<R, M>
> extends SelectProps<string> {
  readonly columns: C[];
  readonly getLabel: (c: C) => string;
}

const ColumnSelect = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.DataColumn<R, M> = Table.DataColumn<R, M>
>({
  columns,
  getLabel,
  ...props
}: ColumnSelectProps<R, M, C>): JSX.Element => (
  <Select
    suffixIcon={<Icon icon={"caret-down"} weight={"solid"} />}
    {...props}
    className={classNames("column-select", props.className)}
    mode={"multiple"}
    showArrow
    tagRender={(params: CustomTagProps) => {
      const column = tabling.columns.getColumn(columns, params.value as string);
      if (!isNil(column)) {
        const colType: Table.ColumnDataType | undefined = !isNil(column.dataType)
          ? find(tabling.models.ColumnTypes, { id: column.dataType })
          : undefined;
        return (
          <Tag
            className={"column-select-tag"}
            style={{ marginRight: 3 }}
            onMouseDown={e => e.stopPropagation()}
            {...params}
          >
            {!isNil(colType) && !isNil(colType.icon) && (
              <div className={"icon-wrapper"}>
                {ui.typeguards.iconIsJSX(colType.icon) ? colType.icon : <Icon icon={colType.icon} />}
              </div>
            )}
            {getLabel(column)}
          </Tag>
        );
      }
      return <></>;
    }}
  >
    {map(columns, (column: C, index: number) => {
      const colType = find(tabling.models.ColumnTypes, { id: column.dataType });
      return (
        <Select.Option className={"column-select-option"} key={index + 1} value={column.field}>
          {!isNil(colType) && !isNil(colType.icon) && (
            <div className={"icon-wrapper"}>
              {ui.typeguards.iconIsJSX(colType.icon) ? colType.icon : <Icon icon={colType.icon} />}
            </div>
          )}
          {getLabel(column)}
        </Select.Option>
      );
    })}
  </Select>
);

export default ColumnSelect;
