import { useState, useEffect, useMemo } from "react";
import { isNil, find } from "lodash";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown, faEdit } from "@fortawesome/free-solid-svg-icons";

import { Column } from "@ag-grid-community/core";

import * as models from "lib/model";
import { getColumnTypeCSSStyle } from "lib/model/util";

import { ShowHide, IconHolder, VerticalFlexCenter } from "components";
import { IconButton } from "components/buttons";

import "./index.scss";

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

export interface HeaderCellProps<R extends Table.Row>
  extends Omit<IHeaderCompParams, "column">,
    StandardComponentProps {
  onSort?: (order: Order, field: keyof R, column: Table.Column<R>) => void;
  onEdit?: (field: keyof R, column: Table.Column<R>) => void;
  ordering?: FieldOrdering<keyof R>;
  column: Table.Column<R>;
}

const HeaderCell = <R extends Table.Row>({
  column,
  displayName,
  onSort,
  className,
  ordering,
  style = {},
  onEdit,
  ...props
}: HeaderCellProps<R>): JSX.Element => {
  const [order, setOrder] = useState<Order>(0);

  const columnType: Table.ColumnType | null = useMemo(() => {
    return find(models.ColumnTypes, { id: column.type } as any) || null;
  }, [column]);

  const columnStyle = useMemo(() => {
    if (!isNil(columnType)) {
      return getColumnTypeCSSStyle(columnType, { header: true });
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
        const fieldOrder: FieldOrder<keyof R> | undefined = find(ordering, { field: column.field } as any);
        if (!isNil(fieldOrder)) {
          setOrder(fieldOrder.order);
        }
      }
    }
  }, [ordering, column]);

  return (
    <div
      className={classNames("header-cell", className)}
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
          <FontAwesomeIcon className={"icon icon--table-header"} icon={columnType.icon} />
        </VerticalFlexCenter>
      )}
      <div className={"text"}>{displayName}</div>
      {!isNil(onEdit) && (
        <VerticalFlexCenter>
          <IconButton
            className={"table-header-edit-btn"}
            size={"small"}
            icon={<FontAwesomeIcon className={"icon"} icon={faEdit} />}
            onClick={() => onEdit(column.field, column)}
          />
        </VerticalFlexCenter>
      )}
      <ShowHide show={column.sortable === true}>
        <IconHolder
          className={"icon-holder--sort"}
          size={"small"}
          style={order === 0 ? { opacity: 0 } : { opacity: 1 }}
        >
          <FontAwesomeIcon icon={order === 1 || 0 ? faArrowUp : faArrowDown} />
        </IconHolder>
      </ShowHide>
    </div>
  );
};

export default HeaderCell;
