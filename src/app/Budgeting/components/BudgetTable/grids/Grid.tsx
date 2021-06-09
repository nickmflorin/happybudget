import { map } from "lodash";

import { AgGridReact } from "@ag-grid-community/react";
import { AllModules } from "@ag-grid-enterprise/all-modules";

import { TABLE_DEBUG } from "config";

import { toAgGridColDef } from "lib/model/util";
import FrameworkComponents from "./FrameworkComponents";

const Grid = ({ columnDefs, frameworkComponents, ...options }: BudgetTable.GridProps): JSX.Element => {
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
      columnDefs={map(columnDefs, (colDef: Table.Column<any, any>) => ({
        ...toAgGridColDef(colDef),
        headerComponentParams: { ...colDef.headerComponentParams, colDef }
      }))}
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
