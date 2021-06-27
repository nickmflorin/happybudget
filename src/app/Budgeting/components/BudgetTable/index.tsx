import { useState, useEffect, useMemo } from "react";
import classNames from "classnames";
import { map, isNil, includes, find, concat, filter } from "lodash";
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
  FirstDataRenderedEvent
} from "@ag-grid-community/core";

import { TABLE_DEBUG, TABLE_PINNING_ENABLED } from "config";
import { WrapInApplicationSpinner, ShowHide } from "components";
import { useDynamicCallback, useDeepEqualMemo } from "lib/hooks";
import { updateFieldOrdering } from "lib/util";
import { currencyValueFormatter } from "lib/model/formatters";

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

const BudgetTable = <
  R extends Table.Row,
  M extends Model.Model,
  G extends Model.Group = Model.Group,
  P extends Http.ModelPayload<M> = Http.ModelPayload<M>
>({
  /* eslint-disable indent */
  columns,
  className,
  style = {},
  groupParams,
  groups = [],
  loading,
  loadingBudget,
  exportFileName,
  nonEditableCells,
  cookies,
  identifierField,
  identifierFieldHeader,
  identifierColumn = {},
  actionColumn = {},
  expandColumn = {},
  indexColumn = {},
  tableFooterIdentifierValue = "Grand Total",
  budgetFooterIdentifierValue = "Budget Total",
  rowCanExpand,
  cellClass,
  onRowAdd,
  onRowExpand,
  isCellEditable,
  isCellSelectable,
  ...props
}: BudgetTable.Props<R, M, G, P>) => {
  const [ordering, setOrdering] = useState<FieldOrder<keyof R>[]>([]);
  const [apis, _setApis] = useState<BudgetTable.GridSet<Table.APIs | null>>({
    primary: null,
    tableFooter: null,
    budgetFooter: null
  });
  const setApis = (id: BudgetTable.GridId) => (gridApis: Table.APIs) => {
    _setApis({ ...apis, [id]: gridApis });
  };

  const [cols, setCols] = useState<Table.Column<R>[]>([]);

  const gridOptions = useMemo((): BudgetTable.GridSet<GridOptions> => {
    let budgetFooter: GridOptions = { ...DefaultBudgetFooterGridOptions, alignedGrids: [] };
    let tableFooter: GridOptions = { ...DefaultTableFooterGridOptions, alignedGrids: [] };
    const primary: GridOptions = { ...DefaultGridOptions, alignedGrids: [budgetFooter, tableFooter] };

    tableFooter = { ...tableFooter, alignedGrids: [budgetFooter, primary] };
    budgetFooter = { ...tableFooter, alignedGrids: [tableFooter, primary] };
    return { primary, tableFooter, budgetFooter };
  }, []);

  const _isCellSelectable = useDynamicCallback<boolean>((row: R, colDef: ColDef | Table.Column<R>): boolean => {
    if (includes(["index", "expand"], colDef.field)) {
      return false;
    } else if (row.meta.isTableFooter === true || row.meta.isGroupFooter === true || row.meta.isBudgetFooter) {
      return false;
    } else if (!isNil(isCellSelectable)) {
      return isCellSelectable(row, colDef);
    }
    return true;
  });

  const _isCellEditable = useDynamicCallback<boolean>((row: R, colDef: ColDef | Table.Column<R>): boolean => {
    if (includes(["index", "expand"], colDef.field)) {
      return false;
    } else if (row.meta.isTableFooter === true || row.meta.isGroupFooter === true || row.meta.isBudgetFooter) {
      return false;
    } else if (!isNil(nonEditableCells) && includes(nonEditableCells, colDef.field as keyof R)) {
      return false;
    } else if (
      includes(
        map(
          filter(columns, (c: Table.Column<R>) => c.isCalculated === true),
          (col: Table.Column<R>) => col.field
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
    return filter(columns, (col: Table.Column<R>) => col.isCalculated === true && !isNil(col.budgetTotal)).length !== 0;
  }, []);

  const onSort = useDynamicCallback<void>((order: Order, field: keyof R) => {
    const newOrdering = updateFieldOrdering(ordering, field, order);
    setOrdering(newOrdering);
    if (!isNil(cookies) && !isNil(cookies.ordering)) {
      const kookies = new Cookies();
      kookies.set(cookies.ordering, newOrdering);
    }
  });

  const ActionColumn = useDynamicCallback<Table.Column<R>>((col: Table.Column<R>): Table.Column<R> => {
    return {
      ...col,
      ...actionColumn,
      cellClass: mergeClassNamesFn("cell--action", "cell--not-editable", "cell--not-selectable", col.cellClass),
      editable: false,
      headerName: "",
      resizable: false
    };
  });

  const IndexColumn = useDynamicCallback<Table.Column<R>>(
    (col: Table.Column<R>): Table.Column<R> =>
      ActionColumn({
        ...indexColumn,
        field: "index",
        cellRenderer: "IndexCell",
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
          onRowAdd: onRowAdd,
          ...col.cellRendererParams,
          ...actionColumn.cellRendererParams,
          ...indexColumn.cellRendererParams
        },
        cellClass: classNames(indexColumn.cellClass, actionColumn.cellClass),
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
      })
  );

  const ExpandColumn = useDynamicCallback<Table.Column<R>>(
    (col: Table.Column<R>): Table.Column<R> =>
      ActionColumn({
        width: 30,
        maxWidth: 30,
        ...expandColumn,
        ...col,
        field: "expand",
        cellRenderer: "ExpandCell",
        pinned: TABLE_PINNING_ENABLED === true ? "left" : undefined,
        cellRendererParams: {
          ...expandColumn.cellRendererParams,
          ...col.cellRendererParams,
          onClick: onRowExpand,
          rowCanExpand
        },
        cellClass: mergeClassNamesFn(col.cellClass, expandColumn.cellClass, actionColumn.cellClass)
      })
  );

  const IdentifierColumn = useDynamicCallback<Table.Column<R>>(
    (col: Table.Column<R>): Table.Column<R> => ({
      field: identifierField,
      headerName: identifierFieldHeader,
      cellRenderer: "IdentifierCell",
      type: "number",
      width: 100,
      ...identifierColumn,
      suppressSizeToFit: true,
      pinned: TABLE_PINNING_ENABLED === true ? "left" : undefined,
      cellRendererParams: {
        ...identifierColumn.cellRendererParams,
        onGroupEdit: groupParams?.onEditGroup,
        groups
      },
      colSpan: (params: ColSpanParams) => {
        const row: R = params.data;
        if (row.meta.isGroupFooter === true) {
          return filter(columns, (c: Table.Column<R>) => !(c.isCalculated === true)).length + 1;
        } else if (!isNil(identifierColumn.colSpan)) {
          return identifierColumn.colSpan(params);
        }
        return 1;
      }
    })
  );

  const CalculatedColumn = useDynamicCallback<Table.Column<R>>((col: Table.Column<R>): Table.Column<R> => {
    return {
      flex: 1,
      cellStyle: { textAlign: "right", ...col.cellStyle },
      ...col,
      cellRenderer: "CalculatedCell",
      suppressSizeToFit: true,
      minWidth: 100,
      valueFormatter: currencyValueFormatter,
      cellRendererParams: {
        ...col.cellRendererParams,
        renderRedIfNegative: true
      },
      cellClass: (params: CellClassParams) => {
        const row: R = params.node.data;
        if (row.meta.isBudgetFooter === false && row.meta.isGroupFooter === false && row.meta.isTableFooter === false) {
          return mergeClassNames(params, "cell--not-editable-highlight", col.cellClass);
        }
        return mergeClassNames(params, col.cellClass);
      }
    };
  });

  const BodyColumn = useDynamicCallback<Table.Column<R>>((col: Table.Column<R>): Table.Column<R> => {
    return {
      cellRenderer: "BodyCell",
      ...col,
      headerComponentParams: {
        ...col.headerComponentParams,
        onSort: onSort,
        ordering
      }
    };
  });

  const UniversalColumn = useDynamicCallback<Table.Column<R>>((col: Table.Column<R>): Table.Column<R> => {
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
      }
    };
  });

  const baseColumns = useMemo((): Table.Column<R>[] => {
    let base: Table.Column<R>[] = [IndexColumn({})];
    if (!isNil(onRowExpand)) {
      // This cell will be hidden for the table footer since the previous index
      // cell will span over this column.
      base.push(ExpandColumn({}));
    }
    base.push(IdentifierColumn({}));
    return base;
  }, [onRowExpand]);

  useEffect(() => {
    if (!isNil(cookies) && !isNil(cookies.ordering)) {
      const kookies = new Cookies();
      const cookiesOrdering = kookies.get(cookies.ordering);
      const validatedOrdering = validateCookiesOrdering(
        cookiesOrdering,
        filter(columns, (col: Table.Column<R>) => !(col.isCalculated === true))
      );
      if (!isNil(validatedOrdering)) {
        setOrdering(validatedOrdering);
      }
    }
  }, [useDeepEqualMemo(cookies)]);

  useEffect(() => {
    const cs = concat(
      baseColumns,
      map(
        filter(columns, (col: Table.Column<R>) => !(col.isCalculated === true)),
        (def: Table.Column<R>) => BodyColumn(def)
      ),
      map(
        filter(columns, (col: Table.Column<R>) => col.isCalculated === true),
        (def: Table.Column<R>) => CalculatedColumn(def)
      )
    );
    setCols(
      map(cs, (col: Table.Column<R>, index: number) => {
        if (index === cs.length - 1) {
          return UniversalColumn({ ...col, resizable: false });
        }
        return UniversalColumn(col);
      })
    );
  }, [useDeepEqualMemo(columns), baseColumns]);

  const onColumnsChange = useDynamicCallback((fields: Field[]) => {
    if (!isNil(apis.primary) && !isNil(apis.tableFooter) && (!showBudgetFooterGrid || !isNil(apis.budgetFooter))) {
      // TODO: We need to take into consideration the column spanning, which is what
      // is causing things to act funky.  To fix this, we should check how the column
      // spans in each grid and make the decision on setting the visibility based
      // on that.
      let columnApis = [apis.primary.column, apis.tableFooter.column];
      let gridApis = [apis.primary.grid, apis.tableFooter.grid];
      if (!isNil(apis.budgetFooter)) {
        columnApis = [...columnApis, apis.budgetFooter.column];
        gridApis = [...gridApis, apis.budgetFooter.grid];
      }
      map(columns, (col: Table.Column<R>) => {
        let visible = false;
        const associatedField = find(fields, { id: col.field });
        if (!isNil(associatedField)) {
          visible = true;
        }
        map(columnApis, (api: ColumnApi) => api.setColumnVisible(col.field, visible));
      });
      map(gridApis, (api: GridApi) => api.sizeColumnsToFit());
    }
  });

  const onGridReady = useDynamicCallback((id: BudgetTable.GridId, gridApis: Table.APIs) => {
    setApis(id)(gridApis);
  });

  const onFirstDataRendered = useDynamicCallback((event: FirstDataRenderedEvent): void => {
    event.api.sizeColumnsToFit();
  });

  return (
    <WrapInApplicationSpinner hideWhileLoading={false} loading={loading}>
      <div className={classNames("budget-table ag-theme-alpine", className)} style={style}>
        <PrimaryGrid<R, M, G>
          apis={apis.primary}
          onGridReady={(e: GridReadyEvent) => onGridReady("primary", { grid: e.api, column: e.columnApi })}
          onFirstDataRendered={onFirstDataRendered}
          identifierField={identifierField}
          columns={cols}
          options={gridOptions.primary}
          ordering={ordering}
          isCellEditable={_isCellEditable}
          onRowExpand={onRowExpand}
          rowCanExpand={rowCanExpand}
          onRowAdd={onRowAdd}
          groups={groups}
          groupParams={groupParams}
          onColumnsChange={onColumnsChange}
          {...props}
        />
        <TableFooterGrid<R>
          apis={apis.tableFooter}
          onGridReady={(e: GridReadyEvent) => onGridReady("tableFooter", { grid: e.api, column: e.columnApi })}
          onFirstDataRendered={onFirstDataRendered}
          options={gridOptions.tableFooter}
          columns={cols}
          identifierField={identifierField}
          identifierValue={tableFooterIdentifierValue}
        />
        <ShowHide show={showBudgetFooterGrid}>
          <BudgetFooterGrid<R>
            apis={apis.budgetFooter}
            onGridReady={(e: GridReadyEvent) => onGridReady("budgetFooter", { grid: e.api, column: e.columnApi })}
            onFirstDataRendered={onFirstDataRendered}
            options={gridOptions.budgetFooter}
            columns={cols}
            identifierField={identifierField}
            identifierValue={budgetFooterIdentifierValue}
            loadingBudget={loadingBudget}
          />
        </ShowHide>
      </div>
    </WrapInApplicationSpinner>
  );
};

export default BudgetTable;
