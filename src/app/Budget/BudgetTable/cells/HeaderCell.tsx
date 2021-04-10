import { useState, useMemo } from "react";
import { isNil, find } from "lodash";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";

import { Column, ColDef } from "ag-grid-community";

import { ShowHide, IconHolder } from "components/display";

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

export interface HeaderCellProps<R extends Table.Row<any, any>> extends IHeaderCompParams, StandardComponentProps {
  onSort?: (order: Order, field: keyof R, colDef: ColDef, column: Column) => void;
  ordering?: FieldOrdering<keyof R>;
}

const HeaderCell = <R extends Table.Row<any, any>>({
  column,
  displayName,
  onSort,
  className,
  ordering,
  style = {}
}: HeaderCellProps<R>): JSX.Element => {
  const [order, setOrder] = useState<Order>(0);
  const colDef = column.getColDef();

  const externalOrder = useMemo(() => {
    if (!isNil(ordering)) {
      const fieldOrder: FieldOrder<keyof R> | undefined = find(ordering, { field: column.getColDef().field } as any);
      if (!isNil(fieldOrder)) {
        return fieldOrder.order;
      }
    }
    return null;
  }, [ordering]);

  return (
    <div
      className={classNames("header-cell", className)}
      style={style}
      onClick={() => {
        const baseOrder = externalOrder || order;
        setOrder(baseOrder === -1 ? 0 : baseOrder === 0 ? 1 : -1);
        !isNil(onSort) &&
          !isNil(colDef.field) &&
          colDef.sortable &&
          onSort(baseOrder === -1 ? 0 : baseOrder === 0 ? 1 : -1, colDef.field as keyof R, colDef, column);
      }}
    >
      <div className={"text"}>{displayName}</div>
      <ShowHide show={colDef.sortable === true}>
        <IconHolder
          className={"icon-holder--sort"}
          size={"small"}
          style={(externalOrder || order) === 0 ? { opacity: 0 } : { opacity: 1 }}
        >
          <FontAwesomeIcon icon={(externalOrder || order) === 1 || 0 ? faArrowUp : faArrowDown} />
        </IconHolder>
      </ShowHide>
    </div>
  );
};

export default HeaderCell;
