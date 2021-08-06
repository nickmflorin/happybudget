import { useMemo } from "react";
import classNames from "classnames";

import { hooks } from "lib";
import * as framework from "../framework";
import FooterGrid, { FooterGridProps } from "./FooterGrid";

type OmitGridProps = "id" | "rowId" | "getFooterColumn" | "onColumnsSet";

interface PageFooterGridProps<R extends Table.Row, M extends Model.Model>
  extends Omit<FooterGridProps<R, M>, OmitGridProps> {
  readonly columns: Table.Column<R, M>[];
  readonly readOnly?: boolean;
  readonly hasExpandColumn: boolean;
}

const PageFooterGrid = <R extends Table.Row, M extends Model.Model>({
  columns,
  readOnly,
  hasExpandColumn,
  ...props
}: PageFooterGridProps<R, M>): JSX.Element => {
  const localColumns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
    let cs = [
      framework.columnObjs.IndexColumn(
        { colSpan: (params: Table.ColSpanParams<R, M>) => (hasExpandColumn ? 2 : 1) },
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
