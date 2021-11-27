import { useMemo, useReducer } from "react";
import hoistNonReactStatics from "hoist-non-react-statics";
import { map, isNil, filter, reduce, uniqueId } from "lodash";
import { GridReadyEvent, GridOptions, FirstDataRenderedEvent } from "@ag-grid-community/core";

import { Config } from "config";
import { tabling, hooks, util } from "lib";

export const DefaultDataGridOptions: GridOptions = {
  defaultColDef: {
    resizable: true,
    sortable: false,
    filter: false,
    suppressMovable: true
  },
  suppressHorizontalScroll: true,
  suppressContextMenu: Config.tableDebug,
  // If for whatever reason, we have a table that cannot support bulk-updating,
  // these two parameters need to be set to true.
  suppressCopyRowsToClipboard: false,
  suppressClipboardPaste: false,
  enableFillHandle: true,
  fillHandleDirection: "y"
};

export const DefaultFooterGridOptions: GridOptions = {
  defaultColDef: {
    resizable: false,
    sortable: false,
    filter: false,
    editable: false,
    suppressMovable: true
  },
  suppressContextMenu: true,
  suppressHorizontalScroll: true
};

type TableConfigurationProvidedProps<R extends Table.RowData> = {
  readonly id: string;
  readonly tableApis: Table.ITableApis;
  readonly hiddenColumns?: Table.HiddenColumns;
  readonly tableGridOptions: Table.TableOptionsSet;
  readonly hasExpandColumn: boolean;
  readonly minimal?: boolean;
  readonly leftAlignNewRowButton?: boolean;
  readonly rowHeight?: number;
  readonly menuPortalId?: string;
  readonly showPageFooter?: boolean;
  readonly rowCanExpand?: boolean | ((row: Table.ModelRow<R>) => boolean);
  // readonly getCSVData: () => CSVData;
  readonly onDataGridReady: (event: GridReadyEvent) => void;
  readonly onFooterGridReady: (event: GridReadyEvent) => void;
  readonly onPageGridReady: (event: GridReadyEvent) => void;
  readonly onFirstDataRendered: (e: FirstDataRenderedEvent) => void;
  readonly changeColumnVisibility: (changes: SingleOrArray<Table.ColumnVisibilityChange>, sizeToFit?: boolean) => void;
};

export type TableConfigurationProps<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
  readonly cookieNames?: Table.CookieNames;
  readonly calculatedColumnWidth?: number;
  readonly checkboxColumn?: Partial<Table.Column<R, M>>;
  readonly checkboxColumnWidth?: number;
  readonly expandColumn?: Partial<Table.Column<R, M>>;
  readonly expandColumnWidth?: number;
  readonly expandCellTooltip?: string;
  readonly showPageFooter?: boolean;
  readonly minimal?: boolean;
  readonly leftAlignNewRowButton?: boolean;
  readonly rowHeight?: number;
  readonly menuPortalId?: string;
  readonly pinFirstColumn?: boolean;
  readonly pinActionColumns?: boolean;
  readonly sizeToFit?: boolean;
  // TODO: We should restrict this to authenticated cases only.
  readonly savingChangesPortalId?: string;
  readonly framework?: Table.Framework;
  readonly className?: Table.GeneralClassName;
  readonly columns: Table.Column<R, M>[];
  readonly expandActionBehavior?: Table.ExpandActionBehavior | ((r: Table.BodyRow<R>) => Table.ExpandActionBehavior);
  readonly rowCanExpand?: boolean | ((row: Table.ModelRow<R>) => boolean);
  readonly onEditRow?: (g: Table.NonPlaceholderBodyRow<R>) => void;
  readonly onRowExpand?: (row: Table.ModelRow<R>) => void;
  readonly onCellFocusChanged?: (params: Table.CellFocusChangedParams<R, M>) => void;
  readonly isCellSelectable?: (params: Table.CellCallbackParams<R, M>) => boolean;
};

export type WithConfiguredTableProps<T, R extends Table.RowData> = T & TableConfigurationProvidedProps<R>;

const InitialAPIs = new tabling.TableApis({});

type SetApiAction = {
  readonly gridId: Table.GridId;
  readonly payload: {
    readonly api: Table.GridApi;
    readonly columnApi: Table.ColumnApi;
  };
};

const apisReducer = (state: tabling.TableApis = InitialAPIs, action: SetApiAction): tabling.TableApis => {
  const newApis = state.clone();
  newApis.set(action.gridId, { grid: action.payload.api, column: action.payload.columnApi });
  return newApis;
};

/* eslint-disable indent */
const configureTable = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  T extends TableConfigurationProps<R, M> = TableConfigurationProps<R, M>
>(
  Component:
    | React.ComponentClass<WithConfiguredTableProps<T, R>, {}>
    | React.FunctionComponent<WithConfiguredTableProps<T, R>>
): React.FunctionComponent<T> => {
  function WithConfigureTable(props: T) {
    const tableId = useMemo(() => uniqueId("table-"), []);
    const [_apis, dispatchApis] = useReducer(apisReducer, InitialAPIs);

    const [hiddenColumns, changeColumnVisibility] = tabling.hooks.useHiddenColumns<R, M>({
      cookie: props.cookieNames?.hiddenColumns,
      columns: map(filter(props.columns, (col: Table.Column<R, M>) => col.canBeHidden !== false)),
      apis: _apis
    });

    const onDataGridReady = useMemo(() => (e: GridReadyEvent) => onGridReady(e, "data"), []);
    const onFooterGridReady = useMemo(() => (e: GridReadyEvent) => onGridReady(e, "footer"), []);
    const onPageGridReady = useMemo(() => (e: GridReadyEvent) => onGridReady(e, "page"), []);

    const onGridReady = useMemo(
      () => (e: GridReadyEvent, gridId: Table.GridId) => {
        dispatchApis({ gridId, payload: { api: e.api, columnApi: e.columnApi } });
      },
      []
    );

    const onFirstDataRendered = useMemo(
      () =>
        (event: FirstDataRenderedEvent): void => {
          const grid = document.querySelector(`#${tableId}`);
          const cols = event.columnApi.getAllDisplayedColumns();
          const width = reduce(
            cols,
            (curr: number, c: Table.AgColumn) => {
              return curr + c.getActualWidth();
            },
            0.0
          );
          if (props.sizeToFit === true || (grid?.clientWidth && width < grid.clientWidth)) {
            event.api.sizeColumnsToFit();
          }
        },
      []
    );

    const tableGridOptions = useMemo((): Table.TableOptionsSet => {
      let page: GridOptions = { ...DefaultFooterGridOptions, alignedGrids: [] };
      let footer: GridOptions = { ...DefaultFooterGridOptions, alignedGrids: [] };
      const data: GridOptions = { ...DefaultDataGridOptions, alignedGrids: [page, footer] };
      footer = { ...footer, alignedGrids: [page, data] };
      page = { ...footer, alignedGrids: [footer, data] };
      return { data, footer, page };
    }, []);

    const hasExpandColumn = useMemo(
      () => !isNil(props.onRowExpand) || !isNil(props.onEditRow),
      [props.onRowExpand, props.onEditRow]
    );

    const columns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
      let orderedColumns = tabling.columns.orderColumns<R, M>(props.columns);

      const pinFirstColumn = (cs: Table.Column<R, M>[]) => {
        const displayedCols = filter(cs, (c: Table.Column<R, M>) => c.tableColumnType !== "fake");
        if (displayedCols.length !== 0) {
          return util.replaceInArray<Table.Column<R, M>>(
            cs,
            (c: Table.Column<R, M>) =>
              tabling.columns.normalizedField(c) === tabling.columns.normalizedField(displayedCols[0]),
            { ...displayedCols[0], pinned: "left" }
          );
        }
        return cs;
      };

      if (hasExpandColumn === true) {
        return [
          tabling.columns.CheckboxColumn<R, M>(
            { ...props.checkboxColumn, pinned: props.pinFirstColumn || props.pinActionColumns ? "left" : undefined },
            hasExpandColumn,
            props.checkboxColumnWidth
          ),
          tabling.columns.ExpandColumn<R, M>(
            {
              pinned: props.pinFirstColumn || props.pinActionColumns ? "left" : undefined,
              // These are only applicable for the non-footer grids, but it is easier to define them
              // at the top Table level than at the Grid level.
              cellRendererParams: {
                ...props.expandColumn?.cellRendererParams,
                expandActionBehavior: props.expandActionBehavior,
                onEditRow: (row: Table.BodyRow<R>) =>
                  tabling.typeguards.isNonPlaceholderBodyRow(row) && props.onEditRow?.(row),
                onExpand: (row: Table.ModelRow<R>) => tabling.typeguards.isDataRow(row) && props.onRowExpand?.(row),
                rowCanExpand: props.rowCanExpand,
                tooltip: props.expandCellTooltip
              }
            },
            props.expandColumnWidth
          ),
          ...(props.pinFirstColumn ? pinFirstColumn(orderedColumns) : orderedColumns)
        ];
      }
      return [
        tabling.columns.CheckboxColumn<R, M>(
          { ...props.checkboxColumn, pinned: props.pinFirstColumn || props.pinActionColumns ? "left" : undefined },
          hasExpandColumn || false,
          props.checkboxColumnWidth
        ),
        ...(props.pinFirstColumn ? pinFirstColumn(orderedColumns) : orderedColumns)
      ];
    }, [
      hooks.useDeepEqualMemo(props.columns),
      props.pinFirstColumn,
      hasExpandColumn,
      props.expandActionBehavior,
      props.onRowExpand,
      props.onEditRow
    ]);

    return (
      <Component
        {...props}
        id={tableId}
        minimal={props.minimal}
        leftAlignNewRowButton={props.leftAlignNewRowButton}
        rowHeight={props.rowHeight}
        menuPortalId={props.menuPortalId}
        savingChangesPortalId={props.savingChangesPortalId}
        showPageFooter={props.showPageFooter}
        columns={columns}
        tableApis={_apis}
        hasExpandColumn={hasExpandColumn}
        tableGridOptions={tableGridOptions}
        hiddenColumns={hiddenColumns}
        rowCanExpand={props.rowCanExpand}
        onDataGridReady={onDataGridReady}
        onFooterGridReady={onFooterGridReady}
        onPageGridReady={onPageGridReady}
        onFirstDataRendered={onFirstDataRendered}
        changeColumnVisibility={changeColumnVisibility}
      />
    );
  }
  return hoistNonReactStatics(WithConfigureTable, Component);
};

export default configureTable;
