import React from "react";
import classNames from "classnames";
import { map, isNil, find } from "lodash";
import { Tag } from "antd";

import { tabling, ui } from "lib";
import { Icon } from "components";
import Select, { SelectProps } from "./Select";

// Does not seem to be exportable from AntD/RCSelect so we just copy it here.
type CustomTagProps = {
  readonly label: React.ReactNode;
  readonly value: any;
  readonly disabled: boolean;
  readonly onClose: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  readonly closable: boolean;
};

export interface ColumnSelectProps<R extends Table.RowData, M extends Model.HttpModel> extends SelectProps<string> {
  readonly columns: Table.Column<R, M>[];
  readonly getLabel: (c: Table.Column<R, M>) => string;
}

const ColumnSelect = <R extends Table.RowData, M extends Model.HttpModel>({
  columns,
  getLabel,
  ...props
}: ColumnSelectProps<R, M>): JSX.Element => {
  return (
    <Select
      suffixIcon={<Icon icon={"caret-down"} weight={"solid"} />}
      {...props}
      className={classNames("select--column", props.className)}
      mode={"multiple"}
      showArrow
      tagRender={(params: CustomTagProps) => {
        const column = find(columns, (c: Table.Column<R, M>) => tabling.columns.normalizedField(c) === params.value);
        if (!isNil(column)) {
          const colType: Table.ColumnType | undefined = !isNil(column.columnType)
            ? find(tabling.models.ColumnTypes, { id: column.columnType })
            : undefined;
          return (
            <Tag className={"column-select-tag"} style={{ marginRight: 3 }} {...params}>
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
      {map(columns, (column: Table.Column<R, M>, index: number) => {
        const colType = find(tabling.models.ColumnTypes, { id: column.columnType });
        return (
          <Select.Option className={"column-select-option"} key={index + 1} value={column.field as string}>
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
};

export default ColumnSelect;
