import { useState, useEffect, useMemo } from "react";
import { isNil, find } from "lodash";
import classNames from "classnames";

import { Column } from "@ag-grid-community/core";

import { tabling } from "lib";
import { Icon, ShowHide, VerticalFlexCenter } from "components";
import { IconButton } from "components/buttons";

// This is defined in AG Grid's documentation but does not seem to be importable from anywhere.
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

export interface HeaderCellProps<R extends Table.Row, M extends Model.Model>
  extends Omit<IHeaderCompParams, "column">,
    StandardComponentProps {
  onSort?: (order: Order, field: Table.Field<R, M>, column: Table.Column<R, M>) => void;
  onEdit?: (field: Table.Field<R, M>, column: Table.Column<R, M>) => void;
  ordering?: FieldOrdering<Table.Field<R, M>>;
  column: Table.Column<R, M>;
}

const HeaderCell = <R extends Table.Row, M extends Model.Model>({
  column,
  displayName,
  onSort,
  className,
  ordering,
  style = {},
  onEdit,
  ...props
}: HeaderCellProps<R, M>): JSX.Element => {
  const [order, setOrder] = useState<Order>(0);

  const columnType: Table.ColumnType | null = useMemo(() => {
    return find(tabling.models.ColumnTypes, { id: column.columnType } as any) || null;
  }, [column]);

  const columnStyle = useMemo(() => {
    if (!isNil(columnType)) {
      return tabling.util.getColumnTypeCSSStyle(columnType, { header: true });
    }
    return {};
  }, [columnType]);

  // NOTE: Because of AG Grid's use of references for rendering performance, the `ordering` prop
  // will not always update in this component when it changes in the parent table component.  This
  // is used for the initial render when an ordering is present in cookies.  We should figure out
  // a better way to do this.
  useEffect(() => {
    if (column.sortable === true) {
      if (!isNil(ordering)) {
        const fieldOrder: FieldOrder<Table.Field<R, M>> | undefined = find(ordering, {
          field: column.field
        } as any);
        if (!isNil(fieldOrder)) {
          setOrder(fieldOrder.order);
        }
      }
    }
  }, [ordering, column]);

  return (
    <div
      className={classNames("inner-cell--header", className)}
      style={{ ...columnStyle, ...style }}
      onClick={() => {
        setOrder(order === -1 ? 0 : order === 0 ? 1 : -1);
        !isNil(onSort) &&
          !isNil(column.field) &&
          column.sortable &&
          onSort(order === -1 ? 0 : order === 0 ? 1 : -1, column.field, column);
      }}
    >
      {!isNil(columnType) && !isNil(columnType.icon) && (
        <VerticalFlexCenter>
          <Icon className={"icon--table-header"} icon={columnType.icon} weight={"solid"} />
        </VerticalFlexCenter>
      )}
      <div className={"text"}>{displayName}</div>
      {!isNil(onEdit) && (
        <VerticalFlexCenter>
          <IconButton
            className={"btn--table-header-edit"}
            size={"small"}
            icon={<Icon icon={"edit"} weight={"solid"} />}
            onClick={() => onEdit(column.field, column)}
          />
        </VerticalFlexCenter>
      )}
      <ShowHide show={column.sortable === true}>
        <Icon
          style={order === 0 ? { opacity: 0 } : { opacity: 1 }}
          weight={"solid"}
          icon={order === 1 || 0 ? "arrow-up" : "arrow-down"}
        />
      </ShowHide>
    </div>
  );
};

export default HeaderCell;
