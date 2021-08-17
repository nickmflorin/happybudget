import { useMemo } from "react";
import classNames from "classnames";

import { hooks } from "lib";
import * as framework from "../framework";
import { CommonGridProps } from "./Grid";
import FooterGrid, { FooterGridProps } from "./FooterGrid";

type OmitGridProps = "id" | "rowId" | "getFooterColumn" | "onColumnsSet";

interface TableFooterGridProps<R extends Table.Row, M extends Model.Model>
  extends Omit<FooterGridProps<R, M>, OmitGridProps>,
    CommonGridProps<R, M> {
  readonly leftAlignNewRowButton?: boolean;
}

const TableFooterGrid = <R extends Table.Row, M extends Model.Model>({
  columns,
  readOnly,
  hasExpandColumn,
  leftAlignNewRowButton,
  ...props
}: TableFooterGridProps<R, M>): JSX.Element => {
  const localColumns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
    let cs = [
      framework.columnObjs.IndexColumn(
        {
          cellRenderer: "NewRowCell",
          // If we want to leftAlign the New Row Button, we do not want to have the cell span 2 columns
          // because then the New Row Button will be centered horizontally between two cells and not
          // aligned with the Index cells in the grid--data.
          colSpan: (params: Table.ColSpanParams<R, M>) =>
            hasExpandColumn && !(leftAlignNewRowButton === true) ? 2 : 1,
          // The onChangeEvent callback is needed to dispatch the action to create a new row.
          cellRendererParams: {
            onChangeEvent: props.onChangeEvent
          }
        },
        hasExpandColumn,
        props.indexColumnWidth
      ),
      ...columns
    ];
    if (hasExpandColumn === true) {
      return [
        cs[0],
        framework.columnObjs.ExpandColumn({ cellRenderer: "EmptyCell" }, props.expandColumnWidth),
        ...cs.slice(1)
      ];
    }
    return cs;
  }, [hooks.useDeepEqualMemo(columns), hasExpandColumn]);

  return (
    <FooterGrid<R, M>
      {...props}
      id={"footer"}
      className={classNames("grid--table-footer", props.className)}
      getFooterColumn={(col: Table.Column<R, M>) => col.footer || null}
      columns={localColumns}
      rowClass={classNames("row--table-footer", props.rowClass)}
      rowId={"footer-row"}
    />
  );
};

export default TableFooterGrid;
