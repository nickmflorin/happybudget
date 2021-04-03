import { useMemo, ReactNode } from "react";
import { isNil, includes } from "lodash";

import { ICellRendererParams } from "ag-grid-community";
import LoadableCellWrapper from "./LoadableCellWrapper";

interface CellRendererProps extends ICellRendererParams, StandardComponentProps {}

const CellRenderer = <R extends Table.Row<any, any>>({
  value,
  node,
  colDef,
  api,
  column,
  columnApi,
  context,
  className,
  style = {}
}: CellRendererProps): JSX.Element => {
  const cellValue = useMemo((): ReactNode => {
    if (!isNil(colDef.valueFormatter) && typeof colDef.valueFormatter === "function") {
      return colDef.valueFormatter({
        value,
        node,
        data: node.data,
        colDef,
        context,
        column,
        api,
        columnApi
      });
    } else {
      return value;
    }
  }, [value, colDef.valueFormatter]);

  const row: R = node.data;
  return (
    <LoadableCellWrapper loading={includes(row.meta.fieldsLoading, colDef.field)}>
      <span className={className} style={style}>
        {cellValue}
      </span>
    </LoadableCellWrapper>
  );
};

export default CellRenderer;
