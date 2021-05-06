import { useMemo } from "react";
import { map, isNil, reduce } from "lodash";

import { AgGridReact } from "@ag-grid-community/react";
import { GridReadyEvent, FirstDataRenderedEvent } from "@ag-grid-community/core";

import { useDynamicCallback, useDeepEqualMemo } from "lib/hooks";
import { hashString } from "lib/util";

import { IndexCell, ValueCell, IdentifierCell, CalculatedCell } from "./cells";
import { IncludeErrorsInCell } from "./cells/Util";
import { TableFooterGridProps, CustomColDef } from "./model";
import { customColDefToColDef } from "./util";
import "./index.scss";

const TableFooterGrid = <R extends Table.Row<G>, G extends Model.Group = Model.Group>({
  identifierField,
  identifierValue,
  options,
  columns,
  colDefs,
  frameworkComponents,
  sizeColumnsToFit,
  setColumnApi
}: TableFooterGridProps<R, G>): JSX.Element => {
  const rowData = useMemo((): R | null => {
    // TODO: Loop over the colDef's after we attribute the Base Columns with isBase = true, so
    // we can weed those out here.
    return reduce(
      columns,
      (obj: { [key: string]: any }, col: CustomColDef<R, G>) => {
        if (!isNil(col.field)) {
          if (col.isCalculated === true) {
            if (!isNil(col.tableTotal)) {
              obj[col.field] = col.tableTotal;
            } else {
              obj[col.field] = null;
            }
          } else {
            obj[col.field] = null;
          }
        }
        return obj;
      },
      {
        id: hashString("tablefooter"),
        [identifierField]: identifierValue,
        meta: {
          isPlaceholder: false,
          isGroupFooter: false,
          isTableFooter: true,
          isBudgetFooter: false,
          selected: false,
          children: [],
          errors: []
        }
      }
    ) as R;
  }, [useDeepEqualMemo(columns), identifierValue]);

  const onFirstDataRendered = useDynamicCallback((event: FirstDataRenderedEvent): void => {
    if (sizeColumnsToFit === true) {
      event.api.sizeColumnsToFit();
    }
  });

  const onGridReady = useDynamicCallback((event: GridReadyEvent): void => {
    setColumnApi(event.columnApi);
  });

  return (
    <div className={"table-footer-grid"}>
      <AgGridReact
        {...options}
        columnDefs={map(colDefs, (def: CustomColDef<R, G>) => customColDefToColDef(def))}
        rowData={[rowData]}
        rowHeight={38}
        rowClass={"row--table-footer"}
        suppressRowClickSelection={true}
        onGridReady={onGridReady}
        onFirstDataRendered={onFirstDataRendered}
        headerHeight={0}
        frameworkComponents={{
          IndexCell: IndexCell,
          ValueCell: IncludeErrorsInCell<R>(ValueCell),
          IdentifierCell: IncludeErrorsInCell<R>(IdentifierCell),
          CalculatedCell: CalculatedCell,
          ...frameworkComponents
        }}
      />
    </div>
  );
};

export default TableFooterGrid;
