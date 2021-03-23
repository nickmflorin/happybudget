import React, { useCallback, useState, useEffect, useMemo } from "react";
import classNames from "classnames";
import { map, isNil, includes, find, concat, uniq, forEach, filter, groupBy } from "lodash";

import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  CellEditingStoppedEvent,
  CellClassParams,
  GridApi,
  GridReadyEvent,
  RowNode,
  EditableCallbackParams,
  ColumnApi,
  Column,
  CellKeyDownEvent,
  CellPosition,
  NavigateToNextCellParams,
  ColSpanParams,
  RowClassParams
} from "ag-grid-community";

import { RenderWithSpinner } from "components/display";
import { downloadAsCsvFile } from "util/files";
import { generateRandomNumericId } from "util/math";

import { DeleteCell, ExpandCell, SelectCell, ValueCell, NewRowCell, UnitCell, IdentifierCell } from "./cells";
import { BudgetTableProps } from "./model";
import TableHeader from "./TableHeader";
import { IncludeErrorsInCell } from "./Util";

import "./index.scss";

const BudgetTable = <
  R extends Table.Row<G, C>,
  G extends Table.RowGroup = Table.RowGroup,
  C extends Table.RowChild = Table.RowChild
>({
  /* eslint-disable indent */
  bodyColumns,
  calculatedColumns = [],
  table,
  search,
  loading,
  saving,
  footerRow,
  frameworkComponents = {},
  exportFileName,
  getExportValue,
  nonEditableCells,
  highlightedNonEditableCells,
  nonHighlightedNonEditableCells,
  groupParams,
  identifierField,
  identifierFieldHeader,
  identifierFieldParams = {},
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
}: BudgetTableProps<R, G, C>) => {
  const [allSelected, setAllSelected] = useState(false);
  const [focused, setFocused] = useState(false);
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);
  const [columnApi, setColumnApi] = useState<ColumnApi | undefined>(undefined);
  const [footerGridApi, setFooterGridApi] = useState<GridApi | undefined>(undefined);
  const [footerColumnApi, setFooterColumnApi] = useState<ColumnApi | undefined>(undefined);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [footerColDefs, setFooterColDefs] = useState<ColDef[]>([]);
  const [_table, setTable] = useState<R[]>([]);

  const groupGetter = useMemo((): ((row: R) => G | null) => {
    if (!isNil(groupParams)) {
      return !isNil(groupParams.groupGetter) ? groupParams.groupGetter : (row: R) => row.group;
    }
    return (row: R) => null;
  }, [groupParams]);

  const groupValueGetter = useMemo((): ((row: R) => any | null) => {
    if (!isNil(groupParams)) {
      return !isNil(groupParams.valueGetter) ? groupParams.valueGetter : (row: R) => groupGetter(row)?.name;
    }
    return (row: R) => null;
  }, [groupParams, groupGetter]);

  const baseColumns = useMemo((): ColDef[][] => {
    let baseLeftColumns: ColDef[] = [
      {
        field: "select",
        editable: false,
        headerName: "",
        width: 40,
        cellClass: classNames("cell--action", "cell--not-editable"),
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
        cellClass: classNames("cell--action", "cell--not-editable"),
        cellRenderer: "ExpandCell",
        cellRendererParams: { onClick: onRowExpand }
      });
    }
    baseLeftColumns.push({
      field: identifierField,
      headerName: identifierFieldHeader,
      cellRenderer: "IdentifierCell",
      ...identifierFieldParams,
      colSpan: (params: ColSpanParams) => {
        const row: R = params.data;
        if (row.meta.isGroupFooter === true) {
          return bodyColumns.length + 1;
        } else if (!isNil(identifierFieldParams.colSpan)) {
          return identifierFieldParams.colSpan(params);
        }
        return 1;
      }
    });
    return [
      baseLeftColumns,
      [
        {
          field: "delete",
          editable: false,
          headerName: "",
          width: 40,
          cellClass: classNames("cell--action", "cell--not-editable"),
          cellRenderer: "DeleteCell",
          cellRendererParams: {
            onClick: (row: R) => {
              if (row.meta.isGroupFooter === true) {
                if (!isNil(groupParams) && !isNil(row.group)) {
                  groupParams.onDeleteGroup(row.group);
                }
              } else {
                onRowDelete(row);
              }
            }
          }
        }
      ]
    ];
  }, [
    groupParams,
    onRowSelect,
    onRowDeselect,
    onRowExpand,
    onRowDelete,
    identifierField,
    identifierFieldHeader,
    identifierFieldParams
  ]);

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

  const createGroupFooter = (group: G): R => {
    const footerObj: { [key: string]: any } = {
      id: generateRandomNumericId(),
      [identifierField]: group.name,
      meta: {
        isPlaceholder: true,
        isGroupFooter: true,
        selected: false,
        children: [],
        errors: []
      }
    };
    forEach([...bodyColumns, ...calculatedColumns], (col: ColDef) => {
      if (!isNil(col.field)) {
        footerObj[col.field] = null;
      }
    });
    return footerObj as R;
  };

  useEffect(() => {
    if (!isNil(groupParams)) {
      const rowsWithGroup = filter(table, (row: R) => !isNil(groupValueGetter(row)));
      const rowsWithoutGroup = filter(table, (row: R) => isNil(groupValueGetter(row)));

      const newTable: R[] = [];

      const groupedRows: { [key: number]: R[] } = groupBy(rowsWithGroup, (row: R) => (groupGetter(row) as G).id);

      const allGroups: (G | null)[] = map(rowsWithGroup, (row: R) => groupGetter(row));
      const groups: G[] = [];
      forEach(allGroups, (group: G | null) => {
        if (!isNil(group) && isNil(find(groups, { id: group.id }))) {
          groups.push(group);
        }
      });
      forEach(groupedRows, (rows: R[], groupId: string) => {
        const group: G | undefined = find(groups, { id: parseInt(groupId) } as any);
        if (!isNil(group)) {
          const footer: R = createGroupFooter(group);
          newTable.push(...rows, {
            ...footer,
            group,
            [identifierField]: group.name,
            meta: { ...footer.meta, isGroupFooter: true }
          });
        }
      });
      setTable([...newTable, ...rowsWithoutGroup]);
    } else {
      setTable(table);
    }
  }, [table, groupParams]);

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
  }, [columnApi, gridApi, focused]);

  useEffect(() => {
    if (!isNil(gridApi) && !isNil(footerGridApi)) {
      gridApi.sizeColumnsToFit();
      footerGridApi.sizeColumnsToFit();
    }
  }, [_table, gridApi, footerGridApi]);

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
        if (node.group === false) {
          const existing: R | undefined = find(_table, { id: node.data.id });
          if (!isNil(existing)) {
            if (
              existing.meta.selected !== node.data.meta.selected ||
              (!isNil(rowRefreshRequired) && rowRefreshRequired(existing, node.data))
            ) {
              gridApi.refreshCells({ force: true, rowNodes: [node] });
            }
          }
        }
      });
    }
  }, [_table, gridApi]);

  useEffect(() => {
    // Changes to the errors in the rows does not trigger a refresh of those cells
    // via AGGridReact because AGGridReact cannot detect changes in that type of
    // data structure for the row.
    if (!isNil(gridApi) && !isNil(columnApi)) {
      gridApi.forEachNode((node: RowNode) => {
        if (node.group === false) {
          const existing: R | undefined = find(_table, { id: node.data.id });
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
        }
      });
    }
  }, [_table, gridApi, columnApi]);

  useEffect(() => {
    const mapped = map(_table, (row: R) => row.meta.selected);
    const uniques = uniq(mapped);
    if (uniques.length === 1 && uniques[0] === true) {
      setAllSelected(true);
    } else {
      setAllSelected(false);
    }
  }, [_table]);

  useEffect(() => {
    setColDefs(
      map(
        concat(
          baseColumns[0],
          map(
            bodyColumns,
            (def: ColDef) =>
              ({
                cellRenderer: "ValueCell",
                ...def
              } as ColDef)
          ),
          map(
            calculatedColumns,
            (def: ColDef) =>
              ({
                cellRenderer: "CalculatedCell",
                ...def
              } as ColDef)
          ),
          baseColumns[1]
        ),
        (col: ColDef) => ({
          ...col,
          suppressMenu: true,
          suppressMenuHide: true,
          editable: (params: EditableCallbackParams) => _isCellEditable(params.node.data as R, params.colDef),
          cellClass: (params: CellClassParams) => {
            if (params.node.group === true) {
              return "";
            }
            if (includes(["delete", "select", "expand"], params.colDef.field)) {
              return col.cellClass;
            }
            const row: R = params.node.data;
            let rootClassNames = undefined;
            if (!isNil(cellClass)) {
              rootClassNames = cellClass(params);
            }
            // TODO: See if we can move some of these to their specific column
            // definitions in the map() above.
            return classNames(col.cellClass, rootClassNames, {
              "cell--not-editable": !_isCellEditable(row, params.colDef),
              "cell--not-editable-highlight": _isCellNonEditableHighlight(row, params.colDef)
            });
          }
        })
      )
    );
  }, [bodyColumns, calculatedColumns]);

  useEffect(() => {
    setFooterColDefs(
      map(
        concat(
          baseColumns[0],
          map(
            bodyColumns,
            (def: ColDef) =>
              ({
                cellRenderer: "ValueCell",
                cellClass: "cell--not-editable",
                ...def
              } as ColDef)
          ),
          map(
            calculatedColumns,
            (def: ColDef) =>
              ({
                cellRenderer: "ValueCell",
                cellClass: "cell--not-editable",
                ...def
              } as ColDef)
          ),
          baseColumns[1]
        ),
        (col: ColDef) => ({
          ...col,
          suppressMenu: true,
          suppressMenuHide: true,
          editable: false
        })
      )
    );
  }, [bodyColumns, calculatedColumns]);

  return (
    <React.Fragment>
      <TableHeader
        search={search}
        setSearch={(value: string) => onSearch(value)}
        columns={[...bodyColumns, ...calculatedColumns]}
        onDelete={() => {
          forEach(_table, (row: R) => {
            if (row.meta.selected === true) {
              onRowDelete(row);
            }
          });
        }}
        onGroup={() => {
          if (!isNil(groupParams)) {
            groupParams.onGroupRows(filter(_table, (row: R) => row.meta.selected === true));
          }
        }}
        saving={saving}
        selected={allSelected}
        onSelect={onSelectAll}
        deleteDisabled={filter(_table, (row: R) => row.meta.selected === true).length === 0}
        groupDisabled={filter(_table, (row: R) => row.meta.selected === true).length === 0}
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
                  map([...bodyColumns, ...calculatedColumns], (c: ColDef) => c.field),
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
            forEach([...bodyColumns, ...calculatedColumns], (col: ColDef) => {
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
      <RenderWithSpinner absolute loading={loading}>
        <div className={"budget-table ag-theme-alpine"} style={{ width: "100%", position: "relative" }}>
          <div className={"primary-grid"}>
            <AgGridReact
              defaultColDef={{
                resizable: false,
                sortable: false,
                filter: false
              }}
              suppressHorizontalScroll={true}
              suppressContextMenu={true}
              columnDefs={colDefs}
              rowDragManaged={true}
              allowContextMenuWithControlKey={true}
              rowData={_table}
              getRowNodeId={(data: any) => data.id}
              getRowClass={(params: RowClassParams) => {
                if (params.node.group === false) {
                  if (params.node.data.meta.isGroupFooter === true) {
                    let colorClass = params.node.data.group.color;
                    if (colorClass.startsWith("#")) {
                      colorClass = params.node.data.group.color.slice(1);
                    }
                    return classNames("row--group-footer", `bg-${colorClass}`);
                  }
                }
                return "";
              }}
              immutableData={true}
              suppressRowClickSelection={true}
              onGridReady={onGridReady}
              rowHeight={36}
              headerHeight={38}
              enableRangeSelection={true}
              clipboardDeliminator={","}
              domLayout={"autoHeight"}
              animateRows={true}
              navigateToNextCell={(params: NavigateToNextCellParams): CellPosition => {
                if (!isNil(params.nextCellPosition)) {
                  if (
                    includes(["estimated", "expand", "select", "delete"], params.nextCellPosition.column.getColId())
                  ) {
                    return params.previousCellPosition;
                  }
                  return params.nextCellPosition;
                }
                return params.previousCellPosition;
              }}
              onCellKeyDown={(event: CellKeyDownEvent) => {
                const count = event.api.getDisplayedRowCount();
                if (!isNil(event.rowIndex) && !isNil(event.event)) {
                  // I do not understand why AGGrid's Event has an underlying Event that is in
                  // reality a KeyboardEvent but does not have any of the properties that a KeyboardEvent
                  // should have - meaning we have to tell TS to ignore this line.
                  /* @ts-ignore */
                  if (event.event.keyCode === 13) {
                    const firstEditCol = event.columnApi.getColumn(event.column.getColId());
                    if (!isNil(firstEditCol)) {
                      event.api.ensureColumnVisible(firstEditCol);
                      event.api.setFocusedCell(event.rowIndex + 1, firstEditCol);
                    }
                    if (count === event.rowIndex + 1) {
                      onRowAdd();
                      if (!isNil(firstEditCol)) {
                        event.api.ensureColumnVisible(firstEditCol);
                      }
                    }
                  }
                }
              }}
              enterMovesDown={true}
              frameworkComponents={{
                DeleteCell: DeleteCell,
                ExpandCell: ExpandCell,
                SelectCell: SelectCell,
                ValueCell: IncludeErrorsInCell<R>(ValueCell),
                UnitCell: IncludeErrorsInCell<R>(UnitCell),
                IdentifierCell: IncludeErrorsInCell<R>(IdentifierCell),
                ...frameworkComponents
              }}
              onCellEditingStopped={(event: CellEditingStoppedEvent) => {
                const field = event.column.getColId();
                if (!isNil(event.newValue)) {
                  if (isNil(event.oldValue) || event.oldValue !== event.newValue) {
                    if (!isNil(event.colDef.valueSetter) && typeof event.colDef.valueSetter !== "string") {
                      const valid = event.colDef.valueSetter({ ...event });
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
              defaultColDef={{
                resizable: false,
                sortable: false,
                filter: false
              }}
              suppressHorizontalScroll={true}
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
      </RenderWithSpinner>
    </React.Fragment>
  );
};

export default BudgetTable;
