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
}

export interface HeaderCellProps<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>
  extends Omit<IHeaderCompParams, "column">,
    StandardComponentProps {
  onEdit?: (field: string, column: Table.BodyColumn<R, M>) => void;
  column: Table.RealColumn<R, M>;
}

const HeaderCell = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>({
  column,
  displayName,
  className,
  style = {},
  onEdit
}: HeaderCellProps<R, M>): JSX.Element => {
  const dataType: Table.ColumnDataType | null = useMemo(() => {
    return tabling.typeguards.isDataColumn(column)
      ? find(tabling.models.ColumnTypes, { id: column.dataType }) || null
      : null;
  }, [column]);

  const columnStyle = useMemo(() => {
    if (!isNil(dataType)) {
      return tabling.columns.getColumnTypeCSSStyle(dataType, { header: true });
    }
    return {};
  }, [dataType]);

  return (
    <div className={classNames("inner-cell--header", className)} style={{ ...columnStyle, ...style }}>
      {!isNil(dataType) && !isNil(dataType.icon) && (
        <VerticalFlexCenter>
          {ui.typeguards.iconIsJSX(dataType.icon) ? (
            dataType.icon
          ) : (
            <Icon className={"icon--table-header"} icon={dataType.icon} weight={"solid"} />
          )}
        </VerticalFlexCenter>
      )}
      <div className={"text"}>{displayName}</div>
      {!isNil(onEdit) && tabling.typeguards.isBodyColumn(column) && (
        <VerticalFlexCenter>
          <IconButton
            iconSize={"xsmall"}
            style={{ float: "right", width: 12 }}
            size={"xsmall"}
            icon={<Icon icon={"edit"} weight={"solid"} />}
            onClick={() => !isNil(column.field) && onEdit(column.field, column)}
          />
        </VerticalFlexCenter>
      )}
    </div>
  );
};

export default React.memo(HeaderCell);
