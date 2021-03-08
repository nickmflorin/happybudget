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
  GridOptions
} from "ag-grid-community";

import TableHeader from "./TableHeader";
import { DeleteCell, ExpandCell, SelectCell, ValueCell, CellEditor, NewRowCell } from "./cells";
import "./index.scss";

interface GenericBudgetTableProps<R> {
  columns: ColDef[];
  table: R[];
  search: string;
  saving: boolean;
  onSearch: (value: string) => void;
  onRowSelect: (id: number | string) => void;
  onRowDeselect: (id: number | string) => void;
  onRowUpdate: (id: number | string, payload: { [key: string]: any }) => void;
  onRowAdd: () => void;
  onRowDelete: (row: R) => void;
  onRowExpand: (id: number) => void;
  onSelectAll: () => void;
  isCellEditable: (row: R, col: ColDef) => boolean;
}

const GenericBudgetTable = <R extends Redux.Budget.IRow>({
  columns,
  table,
  search,
  saving,
  onSearch,
  onSelectAll,
  onRowUpdate,
  onRowSelect,
  onRowDeselect,
  onRowAdd,
  onRowDelete,
  onRowExpand,
  isCellEditable
}: GenericBudgetTableProps<R>) => {
  const [allSelected, setAllSelected] = useState(false);
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);
  const [footerGridApi, setFooterGridApi] = useState<GridApi | undefined>(undefined);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [footerColDefs, setFooterColDefs] = useState<ColDef[]>([]);
  const [gridOptions, setGridOptions] = useState<GridOptions | undefined>(undefined);
  const [footerOptions, setFooterOptions] = useState<GridOptions | undefined>(undefined);

  const onGridReady = useCallback((event: GridReadyEvent): void => {
    setGridApi(event.api);
  }, []);

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
        const existing = find(table, { id: node.data.id });
        if (!isNil(existing)) {
          if (existing.selected !== node.data.selected) {
            gridApi.refreshCells({ force: true, rowNodes: [node] });
          }
        }
      });
    }
  }, [table, gridApi]);

  useEffect(() => {
    const mapped = map(table, (row: R) => row.selected);
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
    setColDefs(
      map(
        concat(
          [
            {
              field: "select",
              editable: false,
              headerName: "",
              width: 50,
              cellRenderer: "SelectCell",
              cellRendererParams: { onSelect: onRowSelect, onDeselect: onRowDeselect }
            },
            {
              field: "expand",
              editable: false,
              headerName: "",
              width: 50,
              cellRenderer: "ExpandCell",
              cellRendererParams: { onClick: onRowExpand }
            }
          ],
          map(
            columns,
            (def: ColDef) =>
              ({
                ...def,
                cellRenderer: "ValueCell",
                cellRendererParams: { isCellEditable },
                filterParams: {
                  textFormatter: (value: Redux.ICell): string => {
                    if (!isNil(value)) {
                      return value.value;
                    }
                    return "";
                  }
                }
              } as ColDef)
          ),
          [
            {
              field: "delete",
              editable: false,
              headerName: "",
              width: 70,
              cellRenderer: "DeleteCell",
              cellRendererParams: { onClick: onRowDelete }
            }
          ]
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
            const row: R = params.node.data;

            if (
              !isNil(params.colDef.field) &&
              params.node.data[params.colDef.field] &&
              !isNil(params.node.data[params.colDef.field].error)
            ) {
              return "error-cell";
            }

            if (!isCellEditable(row, params.colDef)) {
              return "not-editable";
            }
            return "";
          }
        })
      )
    );
  }, [columns]);

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
            if (row.selected === true) {
              onRowDelete(row);
            }
          });
        }}
        saving={saving}
        selected={allSelected}
        onSelect={onSelectAll}
        deleteDisabled={filter(table, (row: R) => row.selected === true).length === 0}
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
          defaultColDef={{
            cellEditor: "CellEditor",
            getQuickFilterText: (params: { value: Redux.ICell }): string => {
              if (!isNil(params.value)) {
                return params.value.value;
              }
              return "";
            }
          }}
          frameworkComponents={{
            DeleteCell: DeleteCell,
            ExpandCell: ExpandCell,
            SelectCell: SelectCell,
            ValueCell: ValueCell,
            CellEditor: CellEditor
          }}
          onCellEditingStopped={(event: CellEditingStoppedEvent) => {
            const field = event.column.getColId();
            onRowUpdate(event.data.id, { [field]: event.newValue.value });
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
              quantity: 0,
              unit: "",
              multiplier: 0,
              rate: 0,
              estimated: 0,
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
