import { useEffect, useState, useMemo } from "react";
import classNames from "classnames";
import { isNil, reduce, map, includes } from "lodash";

import { GridOptions } from "@ag-grid-community/core";

import { hooks } from "lib";
import Grid, { GridProps } from "./Grid";

export const DefaultFooterGridOptions: GridOptions = {
  defaultColDef: {
    resizable: false,
    sortable: false,
    filter: false,
    editable: false,
    suppressMovable: true
  },
  suppressContextMenu: true,
  suppressHorizontalScroll: true
};

type OmitGridProps = "onColumnsSet";

export interface FooterGridProps<R extends Table.Row, M extends Model.Model>
  extends Omit<GridProps<R, M>, OmitGridProps> {
  readonly id: Table.GridId;
  readonly columns: Table.Column<R, M>[];
  readonly rowId: string;
  readonly readOnly?: boolean;
  readonly getFooterColumn: (column: Table.Column<R, M>) => Table.FooterColumn<R, M> | null;
}

const FooterGrid = <R extends Table.Row, M extends Model.Model>({
  columns,
  readOnly,
  rowId,
  getFooterColumn,
  ...props
}: FooterGridProps<R, M>): JSX.Element => {
  const [data, setData] = useState<R[]>([]);

  const localColumns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
    const UniversalFooterColumn = (col: Table.Column<R, M>): Table.Column<R, M> => {
      const footerColumn = getFooterColumn(col);
      if (!isNil(footerColumn)) {
        /*
        While AG Grid will not break if we include extra properties on the ColDef(s)
        (properties from our own custom Table.Column model) - they will complain a lot.
        So we need to try to remove them.
        */
        const { value, ...agFooterColumn } = footerColumn;
        return {
          ...col,
          ...agFooterColumn,
          editable: false
        };
      }
      return { ...col, editable: false };
    };
    return map(columns, (col: Table.Column<R, M>) => UniversalFooterColumn(col));
  }, [hooks.useDeepEqualMemo(columns)]);

  useEffect(() => {
    setData([
      reduce(
        columns,
        (obj: { [key: string]: any }, col: Table.Column<R, M>) => {
          const fieldBehavior: Table.FieldBehavior[] = col.fieldBehavior || ["read", "write"];
          if (includes(fieldBehavior, "read")) {
            obj[col.field as string] = null;
            const footerColumn = getFooterColumn(col);
            if (!isNil(footerColumn) && !isNil(footerColumn.value)) {
              obj[col.field as string] = footerColumn.value;
            }
          }
          return obj;
        },
        {
          id: rowId,
          /*
          Note that this will not be typed in accordance with BudgetTable.RowMeta,
          but we will avoid bugs with it because we never access the rows of a Footer Grid.
          However, it is curious as to why TypeScript does not complain here, and we should
          invesitgate.
          */
          meta: {}
        }
      ) as R
    ]);
  }, [hooks.useDeepEqualMemo(columns)]);

  return (
    <Grid<R, M>
      rowHeight={38}
      {...props}
      className={classNames("grid--footer", props.className)}
      columns={localColumns}
      data={data}
      rowClass={classNames("row--footer", props.rowClass)}
      headerHeight={0}
    />
  );
};

export default FooterGrid;
