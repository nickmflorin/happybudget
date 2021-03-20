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
  Column,
  CellKeyDownEvent,
  CellPosition,
  NavigateToNextCellParams
} from "ag-grid-community";

import { downloadAsCsvFile } from "util/files";

import TableHeader from "./TableHeader";
import { DeleteCell, ExpandCell, SelectCell, ValueCell, NewRowCell, UnitCell } from "./cells";
import "./index.scss";

export interface GetExportValueParams {
  node: RowNode;
  colDef: ColDef;
  value: string | undefined;
}

type ExportValueGetters = { [key: string]: (params: GetExportValueParams) => string };

interface GenericBudgetTableProps<F extends string, E extends Table.IRowMeta, R extends Table.IRow<F, E>> {
  columns: ColDef[];
  table: R[];
  footerRow: Partial<R>;
  search: string;
  saving: boolean;
  frameworkComponents?: { [key: string]: any };
  getExportValue?: ExportValueGetters;
  exportFileName?: string;
  nonEditableCells?: (keyof R)[];
  highlightedNonEditableCells?: (keyof R)[];
  nonHighlightedNonEditableCells?: (keyof R)[];
  cellClass?: (params: CellClassParams) => string | undefined;
  highlightNonEditableCell?: (row: R, col: ColDef) => boolean;
  rowRefreshRequired?: (existing: R, row: R) => boolean;
  onSearch: (value: string) => void;
  onRowSelect: (id: number) => void;
  onRowDeselect: (id: number) => void;
  onRowUpdate: (payload: Table.RowChange) => void;
  onRowAdd: () => void;
  onRowDelete: (row: R) => void;
  onRowExpand?: (id: number) => void;
  onSelectAll: () => void;
  isCellEditable?: (row: R, col: ColDef) => boolean;
}

const GenericBudgetTable = <F extends string, E extends Table.IRowMeta, R extends Table.IRow<F, E>>({
  columns,
  table,
  search,
  saving,
  footerRow,
  frameworkComponents = {},
  exportFileName,
  getExportValue,
  nonEditableCells,
  highlightedNonEditableCells,
  nonHighlightedNonEditableCells,
  cellClass,
  onSearch,
  onSelectAll,
  onRowUpdate,
  onRowSelect,
  onRowDeselect,
  onRowAdd,
  onRowDelete,
  onRowExpand,
  isCellEditable,
  highlightNonEditableCell,
  rowRefreshRequired
}: GenericBudgetTableProps<F, E, R>) => {
  const [allSelected, setAllSelected] = useState(false);
  const [focused, setFocused] = useState(false);
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);
  const [columnApi, setColumnApi] = useState<ColumnApi | undefined>(undefined);
  const [footerGridApi, setFooterGridApi] = useState<GridApi | undefined>(undefined);
  const [footerColumnApi, setFooterColumnApi] = useState<ColumnApi | undefined>(undefined);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [footerColDefs, setFooterColDefs] = useState<ColDef[]>([]);
  const [gridOptions, setGridOptions] = useState<GridOptions | undefined>(undefined);
  const [footerOptions, setFooterOptions] = useState<GridOptions | undefined>(undefined);

  const onGridReady = useCallback((event: GridReadyEvent): void => {
    setGridApi(event.api);
    setColumnApi(event.columnApi);
  }, []);

  const onFooterGridReady = useCallback((event: GridReadyEvent): void => {
    setFooterGridApi(event.api);
    setFooterColumnApi(event.columnApi);
  }, []);

  const _isCellEditable = useCallback(
    (row: R, colDef: ColDef): boolean => {
      if (includes(["delete", "select", "expand"], colDef.field)) {
        return false;
      }
      if (!isNil(nonEditableCells) && includes(nonEditableCells, colDef.field as keyof R)) {
        return false;
      } else if (!isNil(isCellEditable)) {
        return isCellEditable(row, colDef);
      }
      return true;
    },
    [nonEditableCells, isCellEditable]
  );

  const _isCellNonEditableHighlight = useCallback(
    (row: R, colDef: ColDef): boolean => {
      if (includes(["delete", "select", "expand"], colDef.field)) {
        return false;
      }
      if (!_isCellEditable(row, colDef)) {
        if (!isNil(nonHighlightedNonEditableCells)) {
          return !includes(nonHighlightedNonEditableCells, colDef.field as keyof R);
        } else if (!isNil(highlightedNonEditableCells)) {
          return includes(highlightedNonEditableCells, colDef.field as keyof R);
        } else if (!isNil(highlightNonEditableCell)) {
          return highlightNonEditableCell(row, colDef);
        }
        return true;
      }
      return false;
    },
    [nonEditableCells, isCellEditable]
  );

  useEffect(() => {
    if (!isNil(columnApi) && !isNil(gridApi)) {
      const firstEditCol = columnApi.getAllDisplayedColumns()[2];
      if (!isNil(firstEditCol) && focused === false) {
        gridApi.ensureIndexVisible(0);
        gridApi.ensureColumnVisible(firstEditCol);
        setTimeout(() => gridApi.setFocusedCell(0, firstEditCol), 500);
        // TODO: Investigate if there is a better way to do this - currently,
        // this hook is getting triggered numerous times when it shouldn't be.
        // It is because the of the `columns` in the dependency array, which
        // are necessary to get a situation when `firstEditCol` is not null,
        // but also shouldn't be triggering this hook so many times.
        setFocused(true);
      }
    }
  }, [columnApi, gridApi, columns, focused]);

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
    // Changes to the selected rows and other possible HTML based cells do not trigger
    // refreshes via AGGrid because AGGrid cannot detect changes to these HTML
    // based cells.  Therefore, we must trigger the refresh manually.
    if (!isNil(gridApi)) {
      gridApi.forEachNode((node: RowNode) => {
        const existing: R | undefined = find(table, { id: node.data.id });
        if (!isNil(existing)) {
          if (
            existing.meta.selected !== node.data.meta.selected ||
            (!isNil(rowRefreshRequired) && rowRefreshRequired(existing, node.data))
          ) {
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
                  col.setColDef({ ...colDef, cellClass: "cell--error" }, null);
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
        width: 40,
        cellRenderer: "SelectCell",
        cellRendererParams: { onSelect: onRowSelect, onDeselect: onRowDeselect }
      }
    ];
    if (!isNil(onRowExpand)) {
      baseLeftColumns.push({
        field: "expand",
        editable: false,
        headerName: "",
        width: 40,
        cellRenderer: "ExpandCell",
        cellRendererParams: { onClick: onRowExpand }
      });
    }
    const baseRightColumns: ColDef[] = [
      {
        field: "delete",
        editable: false,
        headerName: "",
        width: 40,
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
          editable: (params: EditableCallbackParams) => _isCellEditable(params.node.data as R, params.colDef),
          cellClass: (params: CellClassParams) => {
            if (includes(["delete", "select", "expand"], params.colDef.field)) {
              return "cell--action";
            }
            const row: R = params.node.data;
            let rootClassNames = undefined;
            if (!isNil(cellClass)) {
              rootClassNames = cellClass(params);
            }
            return classNames(col.cellClass, rootClassNames, {
              "cell--not-editable": !_isCellEditable(row, params.colDef),
              "cell--not-editable-highlight": _isCellNonEditableHighlight(row, params.colDef)
            });
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
              width: 40,
              cellRenderer: "NewRowCell",
              cellRendererParams: { onNew: onRowAdd }
            },
            {
              field: "expand",
              editable: false,
              headerName: "",
              width: 40
            }
          ],
          map(
            columns,
            (def: ColDef) =>
              ({
                cellRenderer: "ValueCell",
                ...def
              } as ColDef)
          ),
          [
            {
              field: "delete",
              editable: false,
              headerName: "",
              width: 40
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
              return classNames("cell--action", "cell--not-editable");
            }
            return "cell--not-editable";
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
        columns={columns}
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
        onExport={(fields: Field[]) => {
          if (!isNil(gridApi) && !isNil(columnApi)) {
            const includeColumn = (col: Column): boolean => {
              const colDef = col.getColDef();
              return (
                !isNil(colDef.field) &&
                includes(
                  map(fields, (field: Field) => field.id),
                  colDef.field
                ) &&
                includes(
                  map(columns, (c: ColDef) => c.field),
                  colDef.field
                )
              );
            };

            const cols = filter(columnApi.getAllColumns(), (col: Column) => includeColumn(col));
            const headerRow: CSVRow = [];
            forEach(cols, (col: Column) => {
              const colDef = col.getColDef();
              if (!isNil(colDef.field)) {
                headerRow.push(colDef.headerName);
              }
            });

            const data: CSVData = [headerRow];

            gridApi.forEachNode((node: RowNode, index: number) => {
              const row: CSVRow = [];
              forEach(cols, (col: Column) => {
                const colDef = col.getColDef();
                if (!isNil(colDef.field)) {
                  if (isNil(node.data[colDef.field])) {
                    row.push("");
                  } else {
                    let value = node.data[colDef.field];
                    if (!isNil(getExportValue) && !isNil(getExportValue[colDef.field])) {
                      value = getExportValue[colDef.field]({
                        node,
                        colDef,
                        value
                      });
                    }
                    // TODO: Use a valueSetter instead of a formatter on the cell renderer.
                    if (!isNil(colDef.cellRendererParams) && !isNil(colDef.cellRendererParams.formatter)) {
                      value = colDef.cellRendererParams.formatter(value);
                    }
                    row.push(value);
                  }
                }
              });
              data.push(row);
            });
            let fileName = "make-me-current-date";
            if (!isNil(exportFileName)) {
              fileName = exportFileName;
            }
            downloadAsCsvFile(fileName, data);
          }
        }}
        onColumnsChange={(fields: Field[]) => {
          if (!isNil(columnApi) && !isNil(footerColumnApi)) {
            forEach(columns, (col: ColDef) => {
              if (!isNil(col.field)) {
                const associatedField = find(fields, { id: col.field });
                if (!isNil(associatedField)) {
                  columnApi.setColumnVisible(col.field, true);
                  footerColumnApi.setColumnVisible(col.field, true);
                } else {
                  columnApi.setColumnVisible(col.field, false);
                  footerColumnApi.setColumnVisible(col.field, false);
                }
              }
            });
          }
        }}
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
          rowHeight={36}
          headerHeight={38}
          enableRangeSelection={true}
          clipboardDeliminator={","}
          domLayout={"autoHeight"}
          defaultColDef={{ editable: true }}
          navigateToNextCell={(params: NavigateToNextCellParams): CellPosition => {
            if (!isNil(params.nextCellPosition)) {
              if (includes(["estimated", "expand", "select", "delete"], params.nextCellPosition.column.getColId())) {
                return params.previousCellPosition;
              }
              return params.nextCellPosition;
            }
            return params.previousCellPosition;
          }}
          onCellKeyDown={(event: CellKeyDownEvent) => {
            const count = event.api.getDisplayedRowCount();
            if (!isNil(event.rowIndex) && count === event.rowIndex + 1 && !isNil(event.event)) {
              // I do not understand why AGGrid's Event has an underlying Event that is in
              // reality a KeyboardEvent but does not have any of the properties that a KeyboardEvent
              // should have - meaning we have to tell TS to ignore this line.
              /* @ts-ignore */
              if (event.event.keyCode === 13) {
                onRowAdd();
                const firstEditCol = event.columnApi.getColumn(event.column.getColId());
                if (!isNil(firstEditCol)) {
                  event.api.ensureColumnVisible(firstEditCol);
                  event.api.setFocusedCell(event.rowIndex + 1, firstEditCol);
                }
              }
            }
          }}
          enterMovesDown={true}
          frameworkComponents={{
            DeleteCell: DeleteCell,
            ExpandCell: ExpandCell,
            SelectCell: SelectCell,
            ValueCell: ValueCell,
            UnitCell: UnitCell,
            ...frameworkComponents
          }}
          onCellEditingStopped={(event: CellEditingStoppedEvent) => {
            const field = event.column.getColId() as F;
            if (!isNil(event.newValue)) {
              if (isNil(event.oldValue) || event.oldValue !== event.newValue) {
                if (!isNil(event.colDef.valueSetter) && typeof event.colDef.valueSetter !== "string") {
                  const valid = event.colDef.valueSetter(event.newValue);
                  if (valid === true) {
                    onRowUpdate({
                      id: event.data.id,
                      data: { [field]: { oldValue: event.oldValue, newValue: event.newValue } }
                    });
                  }
                } else {
                  onRowUpdate({
                    id: event.data.id,
                    data: { [field]: { oldValue: event.oldValue, newValue: event.newValue } }
                  });
                }
              }
            }
          }}
        />
      </div>
      <div className={"footer-grid"}>
        <AgGridReact
          gridOptions={footerOptions}
          columnDefs={footerColDefs}
          rowData={[{ meta: { subaccounts: [], errors: [], selected: false, isPlaceholder: false }, ...footerRow }]}
          suppressRowClickSelection={true}
          onGridReady={onFooterGridReady}
          domLayout={"autoHeight"}
          headerHeight={0}
          frameworkComponents={{
            NewRowCell: NewRowCell,
            ValueCell: ValueCell
          }}
        />
      </div>
    </div>
  );
};

export default GenericBudgetTable;
