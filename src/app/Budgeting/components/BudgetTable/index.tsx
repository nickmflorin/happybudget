import { useState, useEffect, useMemo, useImperativeHandle, useRef } from "react";
import classNames from "classnames";
import { map, isNil, includes, filter, reduce, find } from "lodash";
import Cookies from "universal-cookie";

import {
  ColDef,
  CellClassParams,
  EditableCallbackParams,
  GridReadyEvent,
  ColumnApi,
  ColSpanParams,
  GridOptions,
  GridApi,
  CheckboxSelectionCallbackParams,
  FirstDataRenderedEvent,
  ValueSetterParams
} from "@ag-grid-community/core";

import { TABLE_DEBUG, TABLE_PINNING_ENABLED } from "config";
import { WrapInApplicationSpinner, ShowHide } from "components";
import { useDynamicCallback, useDeepEqualMemo } from "lib/hooks";
import { updateFieldOrdering } from "lib/util";
import { agCurrencyValueFormatter } from "lib/model/formatters";
import { orderColumns } from "lib/model/util";

import { validateCookiesOrdering, mergeClassNames, mergeClassNamesFn } from "./util";
import { BudgetFooterGrid, TableFooterGrid, PrimaryGrid } from "./grids";
import "./index.scss";

const DefaultGridOptions: GridOptions = {
  defaultColDef: {
    resizable: true,
    sortable: false,
    filter: false,
    suppressMovable: true
  },
  suppressHorizontalScroll: true,
  suppressContextMenu: process.env.NODE_ENV === "development" && TABLE_DEBUG,
  // If for whatever reason, we have a table that cannot support bulk-updating,
  // these two parameters need to be set to true.
  suppressCopyRowsToClipboard: false,
  suppressClipboardPaste: false,
  enableFillHandle: true,
  fillHandleDirection: "y"
};

const DefaultTableFooterGridOptions: GridOptions = {
  defaultColDef: {
    resizable: false,
    sortable: false,
    filter: false,
    editable: false,
    cellClass: "cell--not-editable",
    suppressMovable: true
  },
  suppressContextMenu: true,
  suppressHorizontalScroll: true
};

const DefaultBudgetFooterGridOptions: GridOptions = {
  defaultColDef: {
    resizable: false,
    sortable: false,
    filter: false,
    editable: false,
    cellClass: "cell--not-editable",
    suppressMovable: true
  },
  suppressContextMenu: true,
  suppressHorizontalScroll: true
};

class BudgetTableApis implements BudgetTable.GridSet<Table.APIs | null> {
  public primary: Table.APIs | null = null;
  public tableFooter: Table.APIs | null = null;
  public budgetFooter: Table.APIs | null = null;

  constructor(config: Partial<BudgetTable.GridSet<Table.APIs | null>>) {
    this.primary = config.primary || null;
    this.tableFooter = config.tableFooter || null;
    this.budgetFooter = config.budgetFooter || null;
  }

  public set = (id: BudgetTable.GridId, apis: Table.APIs) => {
    this[id] = apis;
  };

  public clone = () =>
    new BudgetTableApis({ primary: this.primary, tableFooter: this.tableFooter, budgetFooter: this.budgetFooter });

  public gridMap = (callback: (api: GridApi) => any) => map(this.gridApis, (api: GridApi) => callback(api));
  public columnMap = (callback: (api: ColumnApi) => any) => map(this.columnApis, (api: ColumnApi) => callback(api));

  public get gridApis() {
    const budgetIds: BudgetTable.GridId[] = ["primary", "tableFooter", "budgetFooter"];
    const self = this;
    return reduce(
      budgetIds,
      (grids: GridApi[], id: BudgetTable.GridId) => {
        const apis: Table.APIs | null = self[id];
        if (!isNil(apis)) {
          return [...grids, apis.grid];
        }
        return grids;
      },
      []
    );
  }

  public get columnApis() {
    const budgetIds: BudgetTable.GridId[] = ["primary", "tableFooter", "budgetFooter"];
    const self = this;
    return reduce(
      budgetIds,
      (columns: ColumnApi[], id: BudgetTable.GridId) => {
        const apis: Table.APIs | null = self[id];
        if (!isNil(apis)) {
          return [...columns, apis.column];
        }
        return columns;
      },
      []
    );
  }
}

const BudgetTable = <
  R extends Table.Row,
  M extends Model.Model,
  P extends Http.ModelPayload<M> = Http.ModelPayload<M>
>({
  /* eslint-disable indent */
  tableRef,
  columns,
  className,
  style = {},
  loading,
  loadingBudget,
  loadingParent,
  nonEditableCells,
  cookies,
  levelType,
  budgetType,
  expandColumn = {},
  indexColumn = {},
  onEditGroup,
  rowCanExpand,
  cellClass,
  onChangeEvent,
  onRowExpand,
  isCellEditable,
  isCellSelectable,
  ...props
}: BudgetTable.Props<R, M, P>) => {
  const [ordering, setOrdering] = useState<FieldOrder<keyof R>[]>([]);
  const [apis, _setApis] = useState<BudgetTableApis>(new BudgetTableApis({}));
  const gridRef = useRef<BudgetTable.PrimaryGridRef<R, M>>(null);

  const setApis = (id: BudgetTable.GridId) => (gridApis: Table.APIs) => {
    const newApis = apis.clone();
    newApis.set(id, gridApis);
    _setApis(newApis);
  };

  const [cols, setCols] = useState<Table.Column<R, M>[]>([]);

  const gridOptions = useMemo((): BudgetTable.GridSet<GridOptions> => {
    let budgetFooter: GridOptions = { ...DefaultBudgetFooterGridOptions, alignedGrids: [] };
    let tableFooter: GridOptions = { ...DefaultTableFooterGridOptions, alignedGrids: [] };
    const primary: GridOptions = { ...DefaultGridOptions, alignedGrids: [budgetFooter, tableFooter] };

    tableFooter = { ...tableFooter, alignedGrids: [budgetFooter, primary] };
    budgetFooter = { ...tableFooter, alignedGrids: [tableFooter, primary] };
    return { primary, tableFooter, budgetFooter };
  }, []);

  const _isCellSelectable = useDynamicCallback<boolean>((row: R, colDef: ColDef | Table.Column<R, M>): boolean => {
    if (includes(["index", "expand"], colDef.field)) {
      return false;
    } else if (row.meta.isTableFooter === true || row.meta.isGroupFooter === true || row.meta.isBudgetFooter) {
      return false;
    } else if (!isNil(isCellSelectable)) {
      return isCellSelectable(row, colDef);
    }
    return true;
  });

  const _isCellEditable = useDynamicCallback<boolean>((row: R, colDef: ColDef | Table.Column<R, M>): boolean => {
    if (includes(["index", "expand"], colDef.field)) {
      return false;
    } else if (row.meta.isTableFooter === true || row.meta.isGroupFooter === true || row.meta.isBudgetFooter) {
      return false;
    } else if (!isNil(nonEditableCells) && includes(nonEditableCells, colDef.field as keyof R)) {
      return false;
    } else if (
      includes(
        map(
          filter(columns, (c: Table.Column<R, M>) => c.isCalculated === true),
          (col: Table.Column<R, M>) => col.field
        ),
        colDef.field
      )
    ) {
      return false;
    } else if (!isNil(isCellEditable)) {
      return isCellEditable(row, colDef);
    }
    return true;
  });

  const showBudgetFooterGrid = useMemo(() => {
    return filter(columns, (col: Table.Column<R, M>) => col.isCalculated === true && !isNil(col.budget)).length !== 0;
  }, []);

  const onSort = useDynamicCallback<void>((order: Order, field: keyof R) => {
    const newOrdering = updateFieldOrdering(ordering, field, order);
    setOrdering(newOrdering);
    if (!isNil(cookies) && !isNil(cookies.ordering)) {
      const kookies = new Cookies();
      kookies.set(cookies.ordering, newOrdering);
    }
  });

  useEffect(() => {
    if (!isNil(cookies) && !isNil(cookies.ordering)) {
      const kookies = new Cookies();
      const cookiesOrdering = kookies.get(cookies.ordering);
      const validatedOrdering = validateCookiesOrdering(
        cookiesOrdering,
        filter(columns, (col: Table.Column<R, M>) => !(col.isCalculated === true))
      );
      if (!isNil(validatedOrdering)) {
        setOrdering(validatedOrdering);
      }
    }
  }, [useDeepEqualMemo(cookies)]);

  useEffect(() => {
    const IndexColumn = (): Table.Column<R, M> => ({
      ...indexColumn,
      columnType: "action",
      editable: false,
      headerName: "",
      resizable: false,
      field: "index" as keyof M & keyof R & string,
      cellRenderer: "IndexCell",
      fieldBehavior: [],
      checkboxSelection: (params: CheckboxSelectionCallbackParams) => {
        const row: R = params.data;
        if (row.meta.isGroupFooter === true || row.meta.isTableFooter === true || row.meta.isBudgetFooter === true) {
          return false;
        }
        return true;
      },
      width: isNil(onRowExpand) ? 40 : 25,
      maxWidth: isNil(onRowExpand) ? 40 : 25,
      pinned: TABLE_PINNING_ENABLED === true ? "left" : undefined,
      cellRendererParams: {
        onChangeEvent: onChangeEvent,
        ...indexColumn.cellRendererParams
      },
      cellClass: mergeClassNamesFn("cell--action", "cell--not-editable", "cell--not-selectable", indexColumn.cellClass),
      colSpan: (params: ColSpanParams) => {
        const row: R = params.data;
        if (row.meta.isGroupFooter === true || row.meta.isTableFooter === true || row.meta.isBudgetFooter === true) {
          if (!isNil(onRowExpand)) {
            return 2;
          }
          return 1;
        }
        return 1;
      }
    });

    const ExpandColumn = (): Table.Column<R, M> => ({
      width: 30,
      maxWidth: 30,
      ...expandColumn,
      columnType: "action",
      fieldBehavior: [],
      headerName: "",
      field: "expand" as keyof M & keyof R & string,
      editable: false,
      resizable: false,
      cellRenderer: "ExpandCell",
      pinned: TABLE_PINNING_ENABLED === true ? "left" : undefined,
      cellRendererParams: {
        ...expandColumn.cellRendererParams,
        onClick: onRowExpand,
        rowCanExpand
      },
      cellClass: mergeClassNamesFn("cell--action", "cell--not-editable", "cell--not-selectable", expandColumn.cellClass)
    });

    const CalculatedColumn = (col: Table.Column<R, M>): Table.Column<R, M> => {
      return {
        cellStyle: { textAlign: "right", ...col.cellStyle },
        ...col,
        cellRenderer: "CalculatedCell",
        suppressSizeToFit: true,
        width: 100,
        maxWidth: 100,
        valueFormatter: agCurrencyValueFormatter,
        cellRendererParams: {
          ...col.cellRendererParams,
          renderRedIfNegative: true
        },
        cellClass: (params: CellClassParams) => {
          const row: R = params.node.data;
          if (
            row.meta.isBudgetFooter === false &&
            row.meta.isGroupFooter === false &&
            row.meta.isTableFooter === false
          ) {
            return mergeClassNames(params, "cell--not-editable-highlight", col.cellClass);
          }
          return mergeClassNames(params, col.cellClass);
        }
      };
    };

    const UniversalColumn = (col: Table.Column<R, M>): Table.Column<R, M> => {
      return {
        ...col,
        suppressMenu: true,
        editable: (params: EditableCallbackParams) => _isCellEditable(params.node.data as R, params.colDef),
        cellClass: (params: CellClassParams) => {
          const row: R = params.node.data;
          return mergeClassNames(params, cellClass, col.cellClass, {
            "cell--not-selectable": !_isCellSelectable(row, params.colDef),
            "cell--not-editable": !_isCellEditable(row, params.colDef)
          });
        },
        cellEditorParams: {
          ...col.cellEditorParams,
          budgetType,
          levelType
        },
        cellRendererParams: {
          ...col.cellRendererParams,
          budgetType,
          levelType
        }
      };
    };

    const IdentifierColumn = (
      col: Partial<Table.Column<R, M>> & { field: GenericTable.Field<R, M> }
    ): Table.Column<R, M> => {
      return {
        cellRenderer: "IdentifierCell",
        columnType: "number",
        width: 100,
        maxWidth: 100,
        ...col,
        fieldBehavior: ["read", "write"],
        suppressSizeToFit: true,
        pinned: TABLE_PINNING_ENABLED === true ? "left" : undefined,
        cellRendererParams: {
          ...col.cellRendererParams,
          onGroupEdit: onEditGroup
        },
        colSpan: (params: ColSpanParams) => {
          const row: R = params.data;
          if (row.meta.isGroupFooter === true) {
            const readColumns = filter(columns, (c: Table.Column<R, M>) => {
              const fieldBehavior: Table.FieldBehavior[] = c.fieldBehavior || ["read", "write"];
              return includes(fieldBehavior, "read") && c.isCalculated !== true;
            });
            return readColumns.length;
          } else if (!isNil(col.colSpan)) {
            return col.colSpan(params);
          }
          return 1;
        },
        valueSetter: (params: ValueSetterParams) => {
          // By default, AG Grid treats Backspace clearing the cell as setting the
          // value to undefined - but we have to set it to the null value associated
          // with the column.
          if (params.newValue === undefined) {
            const column: Table.Column<R, M> | undefined = find(columns, { field: params.column.getColId() } as any);
            if (!isNil(column)) {
              params.newValue = column.nullValue === undefined ? null : column.nullValue;
            }
            params.newValue = null;
          }
          if (!isNil(col.valueSetter) && typeof col.valueSetter === "function") {
            return col.valueSetter(params);
          }
          params.data[params.column.getColId()] = params.newValue;
          return true;
        }
      };
    };

    const BodyColumn = (col: Table.Column<R, M>): Table.Column<R, M> => {
      return {
        ...col,
        headerComponentParams: {
          ...col.headerComponentParams,
          onSort: onSort,
          ordering
        },
        valueSetter: (params: ValueSetterParams) => {
          // By default, AG Grid treats Backspace clearing the cell as setting the
          // value to undefined - but we have to set it to the null value associated
          // with the column.
          if (params.newValue === undefined) {
            const column: Table.Column<R, M> | undefined = find(columns, { field: params.column.getColId() } as any);
            if (!isNil(column)) {
              params.newValue = column.nullValue === undefined ? null : column.nullValue;
            }
            params.newValue = null;
          }
          if (!isNil(col.valueSetter) && typeof col.valueSetter === "function") {
            return col.valueSetter(params);
          }
          params.data[params.column.getColId()] = params.newValue;
          return true;
        }
      };
    };

    const orderedColumns = orderColumns<Table.Column<R, M>, R, M>(columns);

    let cs: Table.Column<R, M>[] = [IndexColumn()];
    if (!isNil(onRowExpand)) {
      // This cell will be hidden for the table footer since the previous index
      // cell will span over this column.
      cs.push(ExpandColumn());
    }
    if (orderedColumns.length !== 0) {
      cs = map(
        [
          ...cs,
          IdentifierColumn(orderedColumns[0]),
          ...map(
            filter(orderedColumns.slice(1), (col: Table.Column<R, M>) => !(col.isCalculated === true)),
            (def: Table.Column<R, M>) => BodyColumn(def)
          ),
          ...map(
            filter(orderedColumns.slice(1), (col: Table.Column<R, M>) => col.isCalculated === true),
            (def: Table.Column<R, M>) => CalculatedColumn(def)
          )
        ],
        (col: Table.Column<R, M>, index: number) => {
          if (index === cs.length - 1) {
            return UniversalColumn({ ...col, resizable: false });
          }
          return UniversalColumn(col);
        }
      );
    }
    // Provide our custom Table.Column<R, M> and our custom Table.Column<R, M>[]
    // to each cell editor and cell renderer.
    setCols(
      map(cs, (col: Table.Column<R, M>) => ({
        ...col,
        cellRendererParams: {
          ...col.cellRendererParams,
          columns: cs,
          column: col
        },
        cellEditorParams: {
          ...col.cellEditorParams,
          columns: cs,
          column: col
        }
      }))
    );
  }, [columns, onRowExpand]);

  const setColumnVisibility = useDynamicCallback((change: Table.ColumnVisibilityChange) => {
    apis.columnMap((api: ColumnApi) => api.setColumnVisible(change.field, change.visible));
  });

  const changeColumnVisibility = useDynamicCallback((changes: Table.ColumnVisibilityChange[]) => {
    map(changes, (change: { field: string; visible: boolean }) => setColumnVisibility(change.field, change.visible));
    apis.gridMap((api: GridApi) => api.sizeColumnsToFit());
  });

  useImperativeHandle(tableRef, () => ({
    setColumnVisibility,
    changeColumnVisibility,
    applyGroupColorChange: (group: Model.Group) => {
      const primaryGridRefObj = gridRef.current;
      if (!isNil(primaryGridRefObj)) {
        primaryGridRefObj.applyGroupColorChange(group);
      }
    },
    applyTableChange: (event: Table.ChangeEvent<R, M>) => {
      const primaryGridRefObj = gridRef.current;
      if (!isNil(primaryGridRefObj)) {
        primaryGridRefObj.applyTableChange(event);
      }
    },
    getCSVData: (fields?: string[]) => {
      const primaryGridRefObj = gridRef.current;
      if (!isNil(primaryGridRefObj)) {
        return primaryGridRefObj.getCSVData(fields);
      }
      return [];
    }
  }));

  const onGridReady = useDynamicCallback((id: BudgetTable.GridId, gridApis: Table.APIs) => {
    setApis(id)(gridApis);
  });

  const onFirstDataRendered = useDynamicCallback((event: FirstDataRenderedEvent): void => {
    // event.api.sizeColumnsToFit();
  });

  return (
    <WrapInApplicationSpinner hideWhileLoading={false} loading={loading}>
      <div className={classNames("budget-table ag-theme-alpine", className)} style={style}>
        <div className={"core-grid-wrapper"}>
          <PrimaryGrid<R, M>
            apis={apis.primary}
            gridRef={gridRef}
            onGridReady={(e: GridReadyEvent) => onGridReady("primary", { grid: e.api, column: e.columnApi })}
            onFirstDataRendered={onFirstDataRendered}
            columns={cols}
            options={gridOptions.primary}
            ordering={ordering}
            isCellEditable={_isCellEditable}
            onRowExpand={onRowExpand}
            rowCanExpand={rowCanExpand}
            onChangeEvent={onChangeEvent}
            {...props}
          />
          <TableFooterGrid<R, M>
            apis={apis.tableFooter}
            onGridReady={(e: GridReadyEvent) => onGridReady("tableFooter", { grid: e.api, column: e.columnApi })}
            onFirstDataRendered={onFirstDataRendered}
            options={gridOptions.tableFooter}
            columns={cols}
            loadingParent={loadingParent}
          />
        </div>
        <ShowHide show={showBudgetFooterGrid}>
          <div className={"budget-footer-grid-wrapper"}>
            <div style={{ flexGrow: 100 }}></div>
            <BudgetFooterGrid<R, M>
              apis={apis.budgetFooter}
              onGridReady={(e: GridReadyEvent) => onGridReady("budgetFooter", { grid: e.api, column: e.columnApi })}
              onFirstDataRendered={onFirstDataRendered}
              options={gridOptions.budgetFooter}
              columns={cols}
              loadingBudget={loadingBudget}
            />
          </div>
        </ShowHide>
      </div>
    </WrapInApplicationSpinner>
  );
};

export default BudgetTable;
