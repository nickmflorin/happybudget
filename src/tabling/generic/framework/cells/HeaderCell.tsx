import React, { useMemo } from "react";
import { isNil, find } from "lodash";
import classNames from "classnames";

import { Column } from "@ag-grid-community/core";

import { tabling, ui } from "lib";
import { Icon, VerticalFlexCenter } from "components";
import { IconButton } from "components/buttons";

/* This is defined in AG Grid's documentation but does not seem to be importable
   from anywhere. */
interface IHeaderCompParams {
  column: Column;
  displayName: string;
  enableSorting: boolean;
  enableMenu: boolean;
  eGridHeader: HTMLElement;
  progressSort(multiSort: boolean): void;
  setSort(sort: string, multiSort?: boolean): void;
  showColumnMenu(menuButton: HTMLElement): void;
  api: any;
}

export interface HeaderCellProps<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>
  extends Omit<IHeaderCompParams, "column">,
    StandardComponentProps {
  onEdit?: (field: keyof R, column: Table.Column<R, M>) => void;
  column: Table.Column<R, M>;
}

/* eslint-disable indent */
const HeaderCell = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>({
  column,
  displayName,
  className,
  style = {},
  onEdit,
  ...props
}: HeaderCellProps<R, M>): JSX.Element => {
  const columnType: Table.ColumnType | null = useMemo(() => {
    return find(tabling.models.ColumnTypes, { id: column.columnType } as any) || null;
  }, [column]);

  const columnStyle = useMemo(() => {
    if (!isNil(columnType)) {
      return tabling.columns.getColumnTypeCSSStyle(columnType, { header: true });
    }
    return {};
  }, [columnType]);

  return (
    <div className={classNames("inner-cell--header", className)} style={{ ...columnStyle, ...style }}>
      {!isNil(columnType) && !isNil(columnType.icon) && (
        <VerticalFlexCenter>
          {ui.typeguards.iconIsJSX(columnType.icon) ? (
            columnType.icon
          ) : (
            <Icon className={"icon--table-header"} icon={columnType.icon} weight={"solid"} />
          )}
        </VerticalFlexCenter>
      )}
      <div className={"text"}>{displayName}</div>
      {!isNil(onEdit) && (
        <VerticalFlexCenter>
          <IconButton
            className={"btn--table-header-edit"}
            size={"small"}
            icon={<Icon icon={"edit"} weight={"solid"} />}
            onClick={() => !isNil(column.field) && onEdit(column.field, column)}
          />
        </VerticalFlexCenter>
      )}
    </div>
  );
};

export default React.memo(HeaderCell);
