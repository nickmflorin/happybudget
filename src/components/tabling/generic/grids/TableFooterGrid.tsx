import { useMemo } from "react";
import classNames from "classnames";

import { hooks } from "lib";
import * as framework from "../framework";
import FooterGrid, { FooterGridProps } from "./FooterGrid";

type OmitGridProps = "id" | "rowId" | "getFooterColumn" | "onColumnsSet";

interface TableFooterGridProps<R extends Table.Row, M extends Model.Model>
  extends Omit<FooterGridProps<R, M>, OmitGridProps> {
  readonly columns: Table.Column<R, M>[];
  readonly readOnly?: boolean;
  readonly hasExpandColumn: boolean;
}

const TableFooterGrid = <R extends Table.Row, M extends Model.Model>({
  columns,
  readOnly,
  hasExpandColumn,
  ...props
}: TableFooterGridProps<R, M>): JSX.Element => {
  const localColumns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
    let cs = [
      framework.columnObjs.IndexColumn(
        {
          cellRenderer: "NewRowCell",
          colSpan: (params: Table.ColSpanParams<R, M>) => (hasExpandColumn ? 2 : 1),
          // The onChangeEvent callback is needed to dispatch the action to create a new row.
          cellRendererParams: {
            onChangeEvent: props.onChangeEvent
          }
        },
        hasExpandColumn
      ),
      ...columns
    ];
    if (hasExpandColumn === true) {
      return [cs[0], framework.columnObjs.ExpandColumn({ cellRenderer: "EmptyCell" }), ...cs.slice(1)];
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
