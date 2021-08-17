import { useMemo } from "react";
import classNames from "classnames";

import { hooks } from "lib";
import * as framework from "../framework";
import { CommonGridProps } from "./Grid";
import FooterGrid, { FooterGridProps } from "./FooterGrid";

type OmitGridProps = "id" | "rowId" | "getFooterColumn" | "onColumnsSet";

interface PageFooterGridProps<R extends Table.Row, M extends Model.Model>
  extends Omit<FooterGridProps<R, M>, OmitGridProps>,
    CommonGridProps<R, M> {
  readonly leftAlignNewRowButton?: boolean;
}

const PageFooterGrid = <R extends Table.Row, M extends Model.Model>({
  columns,
  readOnly,
  hasExpandColumn,
  leftAlignNewRowButton,
  ...props
}: PageFooterGridProps<R, M>): JSX.Element => {
  const localColumns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
    let cs = [
      framework.columnObjs.IndexColumn(
        {
          // If we want to leftAlign the New Row Button, we do not want to have the cell span 2 columns
          // because then the New Row Button will be centered horizontally between two cells and not
          // aligned with the Index cells in the grid--data.
          colSpan: (params: Table.ColSpanParams<R, M>) => (hasExpandColumn && !(leftAlignNewRowButton === true) ? 2 : 1)
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
      id={"page"}
      className={classNames("grid--page-footer", props.className)}
      getFooterColumn={(col: Table.Column<R, M>) => col.page || null}
      columns={localColumns}
      rowClass={classNames("row--page-footer", props.rowClass)}
      rowId={"page-row"}
      rowHeight={28}
    />
  );
};

export default PageFooterGrid;
