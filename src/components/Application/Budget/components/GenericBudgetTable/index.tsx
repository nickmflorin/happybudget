import { useCallback, useState, useEffect } from "react";
import classNames from "classnames";
import { map, isNil, includes, find, concat, uniq, forEach, filter } from "lodash";

import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  CellEditingStoppedEvent,
  CellClassParams,
  GridApi,
  GridReadyEvent,
  RowNode,
  EditableCallbackParams,
  GridOptions,
  ColumnApi,
  Column
} from "ag-grid-community";

import TableHeader from "./TableHeader";
import { DeleteCell, ExpandCell, SelectCell, ValueCell, CellEditor, NewRowCell, UnitCell } from "./cells";
import "./index.scss";

interface GenericBudgetTableProps<F extends string, E extends Table.IRowMeta<F>, R extends Table.IRow<F, E>> {
  columns: ColDef[];
  table: R[];
  search: string;
  saving: boolean;
  estimated: number;
  onSearch: (value: string) => void;
  onRowSelect: (id: number) => void;
  onRowDeselect: (id: number) => void;
  onRowUpdate: (id: number, payload: { [key: string]: any }) => void;
  onRowAdd: () => void;
  onRowDelete: (row: R) => void;
  onRowExpand?: (id: number) => void;
  onSelectAll: () => void;
  isCellEditable: (row: R, col: ColDef) => boolean;
}

const GenericBudgetTable = <F extends string, E extends Table.IRowMeta<F>, R extends Table.IRow<F, E>>({
  columns,
  table,
  search,
  saving,
  estimated,
  onSearch,
  onSelectAll,
  onRowUpdate,
  onRowSelect,
  onRowDeselect,
  onRowAdd,
  onRowDelete,
  onRowExpand,
  isCellEditable
}: GenericBudgetTableProps<F, E, R>) => {
  const [allSelected, setAllSelected] = useState(false);
  const [focused, setFocused] = useState(false);
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);
  const [columnApi, setColumnApi] = useState<ColumnApi | undefined>(undefined);
  const [footerGridApi, setFooterGridApi] = useState<GridApi | undefined>(undefined);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [footerColDefs, setFooterColDefs] = useState<ColDef[]>([]);
  const [gridOptions, setGridOptions] = useState<GridOptions | undefined>(undefined);
  const [footerOptions, setFooterOptions] = useState<GridOptions | undefined>(undefined);

  const onGridReady = useCallback((event: GridReadyEvent): void => {
    setGridApi(event.api);
    setColumnApi(event.columnApi);
  }, []);

  useEffect(() => {
    if (!isNil(columnApi) && !isNil(gridApi)) {
      const firstEditCol = columnApi.getAllDisplayedColumns()[2];
      if (!isNil(firstEditCol) && focused === false) {
        gridApi.ensureIndexVisible(0);
        gridApi.ensureColumnVisible(firstEditCol);
        gridApi.setFocusedCell(0, firstEditCol);
        // TODO: Investigate if there is a better way to do this - currently,
        // this hook is getting triggered numerous times when it shouldn't be.
        // It is because the of the `columns` in the dependency array, which
        // are necessary to get a situation when `firstEditCol` is not null,
        // but also shouldn't be triggering this hook so many times.
        setFocused(true);
      }
    }
  }, [columnApi, gridApi, columns, focused]);

  const onFooterGridReady = useCallback((event: GridReadyEvent): void => {
    setFooterGridApi(event.api);
  }, []);

  useEffect(() => {
    if (!isNil(gridApi) && !isNil(footerGridApi)) {
      gridApi.sizeColumnsToFit();
      footerGridApi.sizeColumnsToFit();
    }
  }, [table, gridApi, footerGridApi]);

  useEffect(() => {
    if (!isNil(gridApi)) {
      gridApi.setQuickFilter(search);
    }
  }, [search, gridApi]);

  useEffect(() => {
    // Changes to the selected rows does not trigger a refresh of those cells
    // via AGGridReact because AGGridReact cannot detect changes to an HTML checkbox
    // as a change to the value of a cell.  Therefore, we must trigger the refresh
    // manually.
    if (!isNil(gridApi)) {
      gridApi.forEachNode((node: RowNode) => {
        const existing: R | undefined = find(table, { id: node.data.id });
        if (!isNil(existing)) {
          if (existing.meta.selected !== node.data.meta.selected) {
            gridApi.refreshCells({ force: true, rowNodes: [node] });
          }
        }
      });
    }
  }, [table, gridApi]);

  useEffect(() => {
    // Changes to the errors in the rows does not trigger a refresh of those cells
    // via AGGridReact because AGGridReact cannot detect changes in that type of
    // data structure for the row.
    if (!isNil(gridApi) && !isNil(columnApi)) {
      gridApi.forEachNode((node: RowNode) => {
        const existing: R | undefined = find(table, { id: node.data.id });
        if (!isNil(existing)) {
          // TODO: We might want to do a deeper comparison in the future here.
          if (existing.meta.errors.length !== node.data.meta.errors.length) {
            const cols = columnApi.getAllColumns();
            forEach(cols, (col: Column) => {
              const colDef = col.getColDef();
              if (!isNil(colDef.field)) {
                const cellErrors = filter(existing.meta.errors, { id: node.data.id, field: colDef.field });
                if (cellErrors.length !== 0) {
                  gridApi.refreshCells({ force: true, rowNodes: [node], columns: [col] });
                }
              }
            });
          }
        }
      });
    }
  }, [table, gridApi, columnApi]);

  useEffect(() => {
    const mapped = map(table, (row: R) => row.meta.selected);
    const uniques = uniq(mapped);
    if (uniques.length === 1 && uniques[0] === true) {
      setAllSelected(true);
    } else {
      setAllSelected(false);
    }
  }, [table]);

  useEffect(() => {
    const topOptions = {
      alignedGrids: [],
      defaultColDef: {
        resizable: false,
        sortable: true,
        filter: false
      },
      suppressHorizontalScroll: true
    };
    const bottomOptions = {
      alignedGrids: [],
      defaultColDef: {
        resizable: false,
        sortable: true,
        filter: false
      }
    };
    setGridOptions(topOptions);
    setFooterOptions(bottomOptions);
  }, []);

  useEffect(() => {
    const baseLeftColumns: ColDef[] = [
      {
        field: "select",
        editable: false,
        headerName: "",
        width: 50,
        cellRenderer: "SelectCell",
        cellRendererParams: { onSelect: onRowSelect, onDeselect: onRowDeselect }
      }
    ];
    if (!isNil(onRowExpand)) {
      baseLeftColumns.push({
        field: "expand",
        editable: false,
        headerName: "",
        width: 50,
        cellRenderer: "ExpandCell",
        cellRendererParams: { onClick: onRowExpand }
      });
    }
    const baseRightColumns: ColDef[] = [
      {
        field: "delete",
        editable: false,
        headerName: "",
        width: 70,
        cellRenderer: "DeleteCell",
        cellRendererParams: { onClick: onRowDelete }
      }
    ];
    setColDefs(
      map(
        concat(
          baseLeftColumns,
          map(
            columns,
            (def: ColDef) =>
              ({
                cellRenderer: "ValueCell",
                ...def
              } as ColDef)
          ),
          baseRightColumns
        ),
        (col: ColDef) => ({
          ...col,
          suppressMenu: true,
          suppressMenuHide: true,
          editable: (params: EditableCallbackParams) => {
            if (includes(["delete", "select", "expand"], params.colDef.field)) {
              return false;
            }
            const row: R = params.node.data;
            return isCellEditable(row, params.colDef);
          },
          cellClass: (params: CellClassParams) => {
            if (includes(["delete", "select", "expand"], params.colDef.field)) {
              return "action-cell";
            }
            // TODO: This is not working!
            const row: R = params.node.data;
            let hasError = false;
            if (row.meta.errors.length !== 0 && !isNil(params.colDef.field)) {
              const field = params.colDef.field;
              const errors = filter(
                row.meta.errors,
                (error: Table.ICellError<F>) => error.field === field && error.id === row.id
              );
              if (errors.length !== 0) {
                hasError = true;
              }
            }
            if (!isCellEditable(row, params.colDef)) {
              return classNames("not-editable", {
                "not-editable-highlight": params.colDef.field !== "unit",
                "unit-cell": params.colDef.field === "unit"
              });
            }
            return classNames({ "has-error": hasError, "unit-cell": params.colDef.field === "unit" });
          }
        })
      )
    );
  }, [columns.length]);

  useEffect(() => {
    setFooterColDefs(
      map(
        concat(
          [
            {
              field: "select",
              editable: false,
              headerName: "",
              width: 50,
              cellRenderer: "NewRowCell",
              cellRendererParams: { onNew: onRowAdd }
            },
            {
              field: "expand",
              editable: false,
              headerName: "",
              width: 50
            }
          ],
          columns,
          [
            {
              field: "delete",
              editable: false,
              headerName: "",
              width: 70
            }
          ]
        ),
        (col: ColDef) => ({
          ...col,
          suppressMenu: true,
          suppressMenuHide: true,
          editable: false,
          cellClass: (params: CellClassParams) => {
            if (includes(["delete", "select", "expand"], params.colDef.field)) {
              return classNames("action-cell", "not-editable");
            }
            return "not-editable";
          }
        })
      )
    );
  }, [columns]);

  return (
    <div className={"ag-theme-alpine"} style={{ width: "100%", position: "relative" }}>
      <TableHeader
        search={search}
        setSearch={(value: string) => onSearch(value)}
        onDelete={() => {
          forEach(table, (row: R) => {
            if (row.meta.selected === true) {
              onRowDelete(row);
            }
          });
        }}
        saving={saving}
        selected={allSelected}
        onSelect={onSelectAll}
        deleteDisabled={filter(table, (row: R) => row.meta.selected === true).length === 0}
      />
      <div className={"primary-grid"}>
        <AgGridReact
          gridOptions={gridOptions}
          columnDefs={colDefs}
          rowDragManaged={true}
          allowContextMenuWithControlKey={true}
          rowData={table}
          getRowNodeId={(data: any) => data.id}
          immutableData={true}
          suppressRowClickSelection={true}
          onGridReady={onGridReady}
          domLayout={"autoHeight"}
          frameworkComponents={{
            DeleteCell: DeleteCell,
            ExpandCell: ExpandCell,
            SelectCell: SelectCell,
            ValueCell: ValueCell,
            UnitCell: UnitCell,
            CellEditor: CellEditor
          }}
          onCellEditingStopped={(event: CellEditingStoppedEvent) => {
            const field = event.column.getColId();
            if (!isNil(event.newValue)) {
              if (isNil(event.oldValue) || event.oldValue !== event.newValue) {
                onRowUpdate(event.data.id, { [field]: event.newValue });
              }
            }
          }}
        />
      </div>
      <div className={"footer-grid"}>
        <AgGridReact
          gridOptions={footerOptions}
          columnDefs={footerColDefs}
          rowData={[
            {
              selected: false,
              description: "",
              line: "",
              isPlaceholder: true,
              name: "",
              quantity: "",
              unit: "",
              multiplier: "",
              rate: "",
              estimated,
              variance: 0,
              subaccounts: []
            }
          ]}
          suppressRowClickSelection={true}
          onGridReady={onFooterGridReady}
          domLayout={"autoHeight"}
          headerHeight={0}
          frameworkComponents={{
            NewRowCell: NewRowCell
          }}
        />
      </div>
    </div>
  );
};

export default GenericBudgetTable;
