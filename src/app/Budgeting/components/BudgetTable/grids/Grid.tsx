import { map } from "lodash";

import { AgGridReact } from "@ag-grid-community/react";
import { AllModules } from "@ag-grid-enterprise/all-modules";
import { ColDef } from "@ag-grid-community/core";

import { TABLE_DEBUG } from "config";

import { toAgGridColDef } from "lib/model/util";
import FrameworkComponents from "./FrameworkComponents";

const Grid = <R extends Table.Row = Table.Row>({
  columnDefs,
  frameworkComponents,
  ...options
}: BudgetTable.GridProps<R>): JSX.Element => {
  return (
    <AgGridReact
      rowHeight={36}
      headerHeight={38}
      allowContextMenuWithControlKey={true}
      cellFlashDelay={100}
      cellFadeDelay={500}
      suppressRowClickSelection={true}
      undoRedoCellEditing={true}
      undoRedoCellEditingLimit={5}
      stopEditingWhenGridLosesFocus={true}
      enableRangeSelection={true}
      animateRows={true}
      enterMovesDown={false}
      {...options}
      // Required to get processCellFromClipboard to work with column spanning.
      suppressCopyRowsToClipboard={true}
      columnDefs={map(columnDefs, (colDef: Table.Column<R>) => {
        let original: ColDef = toAgGridColDef<R>(colDef);
        original = { ...original, headerComponentParams: { ...colDef.headerComponentParams, colDef } };
        return original;
      })}
      debug={process.env.NODE_ENV === "development" && TABLE_DEBUG}
      /* @ts-ignore */
      modules={AllModules}
      overlayNoRowsTemplate={"<span></span>"}
      overlayLoadingTemplate={"<span></span>"}
      frameworkComponents={{
        ...FrameworkComponents,
        ...frameworkComponents
      }}
    />
  );
};

export default Grid;
