import { map } from "lodash";

import { AgGridReact } from "@ag-grid-community/react";
import { AllModules } from "@ag-grid-enterprise/all-modules";
import { ColDef } from "@ag-grid-community/core";

import { TABLE_DEBUG } from "config";

import { toAgGridColDef } from "lib/model/util";
import FrameworkComponents from "./FrameworkComponents";

const Grid = <R extends Table.Row = Table.Row>({
  columns,
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
      columnDefs={map(columns, (col: Table.Column<R>) => {
        let original: ColDef = toAgGridColDef<R>(col);
        original = { ...original, headerComponentParams: { ...col.headerComponentParams, column: col } };
        return original;
      })}
      debug={process.env.NODE_ENV === "development" && TABLE_DEBUG}
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
