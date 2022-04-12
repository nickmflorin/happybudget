import React, { useMemo, useRef, useReducer } from "react";
import hoistNonReactStatics from "hoist-non-react-statics";
import { map, isNil, filter, reduce } from "lodash";
import { Subtract } from "utility-types";

import { Config } from "config";
import { tabling, hooks, util } from "lib";

import * as genericColumns from "../columns";
import { useHiddenColumns } from "../hooks";

export const DefaultDataGridOptions: Table.GridOptions = {
  defaultColDef: {
    resizable: true,
    sortable: false,
    filter: false,
    suppressMovable: true
  },
  suppressHorizontalScroll: true,
  suppressContextMenu: Config.tableDebug,
  /* If for whatever reason, we have a table that cannot support bulk-updating,
     these two parameters need to be set to true. */
  suppressCopyRowsToClipboard: false,
  suppressClipboardPaste: false,
  enableFillHandle: true,
  fillHandleDirection: "y"
};

export const DefaultFooterGridOptions: Table.GridOptions = {
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

export type ConfiguredTableInjectedProps = {
  readonly rendered: Table.GridSet<boolean>;
  readonly tableApis: Table.ITableApis;
  readonly hiddenColumns?: Table.HiddenColumns;
  readonly tableGridOptions: Table.TableOptionsSet;
  readonly hasEditColumn: boolean;
  readonly onDataGridReady: (event: Table.GridReadyEvent) => void;
  readonly onFooterGridReady: (event: Table.GridReadyEvent) => void;
  readonly onPageGridReady: (event: Table.GridReadyEvent) => void;
  readonly onFirstDataRendered: (e: Table.FirstDataRenderedEvent) => void;
  readonly changeColumnVisibility: (changes: SingleOrArray<Table.ColumnVisibilityChange>, sizeToFit?: boolean) => void;
};

export type TableConfigurationProps<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
  readonly tableId: string;
  readonly hideEditColumn?: boolean;
  readonly editColumn?: Table.PartialActionColumn<R, M>;
  readonly editColumnWidth?: number;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  readonly editColumnConfig?: Table.EditColumnRowConfig<R, any>[];
  readonly pinFirstColumn?: boolean;
  readonly pinActionColumns?: boolean;
  readonly sizeToFit?: boolean;
  readonly framework?: Table.Framework;
  readonly columns: Table.Column<R, M>[];
};

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

const InitialDataRenderedSet: Table.GridSet<boolean> = {
  data: false,
  footer: false,
  page: false
};

const useTrackGridDataRender = (): [Table.GridSet<boolean>, (gridId: Table.GridId) => void] => {
  const rendered = useRef<Table.GridSet<boolean>>(InitialDataRenderedSet);

  const onGridDataRendered = hooks.useDynamicCallback((gridId: Table.GridId) => {
    rendered.current = { ...rendered.current, [gridId]: true };
  });

  return [rendered.current, onGridDataRendered];
};

const configureTable = <
  T extends ConfiguredTableInjectedProps,
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
>(
  Component: React.FunctionComponent<T>
): React.FunctionComponent<Subtract<T, ConfiguredTableInjectedProps> & TableConfigurationProps<R, M>> => {
  function WithConfigureTable(props: Subtract<T, ConfiguredTableInjectedProps> & TableConfigurationProps<R, M>) {
    const [_apis, dispatchApis] = useReducer(apisReducer, InitialAPIs);
    const [rendered, gridDataRendered] = useTrackGridDataRender();

    const [hiddenColumns, changeColumnVisibility] = useHiddenColumns<R, M>({
      tableId: props.tableId,
      columns: map(
        filter(
          props.columns,
          (col: Table.Column<R, M>) => tabling.columns.isDataColumn(col) && col.canBeHidden !== false
        ) as Table.DataColumn<R, M>[]
      ),
      apis: _apis
    });

    const onGridReady = useMemo(
      () => (e: Table.GridReadyEvent, gridId: Table.GridId) => {
        dispatchApis({ gridId, payload: { api: e.api, columnApi: e.columnApi } });
        gridDataRendered(gridId);
      },
      []
    );

    const onDataGridReady = useMemo(() => (e: Table.GridReadyEvent) => onGridReady(e, "data"), []);
    const onFooterGridReady = useMemo(() => (e: Table.GridReadyEvent) => onGridReady(e, "footer"), []);
    const onPageGridReady = useMemo(() => (e: Table.GridReadyEvent) => onGridReady(e, "page"), []);

    const onFirstDataRendered = useMemo(
      () =>
        (event: Table.FirstDataRenderedEvent): void => {
          const grid = document.querySelector(`#${props.tableId}`);
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
      let page: Table.GridOptions = { ...DefaultFooterGridOptions, alignedGrids: [] };
      let footer: Table.GridOptions = { ...DefaultFooterGridOptions, alignedGrids: [] };
      const data: Table.GridOptions = { ...DefaultDataGridOptions, alignedGrids: [page, footer] };
      footer = { ...footer, alignedGrids: [page, data] };
      page = { ...footer, alignedGrids: [footer, data] };
      return { data, footer, page };
    }, []);

    const hasEditColumn = useMemo(
      () => (props.hideEditColumn === true ? false : !isNil(props.editColumnConfig)),
      [props.editColumnConfig, props.hideEditColumn]
    );

    const columns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
      const pinFirstColumn = (cs: Table.Column<R, M>[]) => {
        const realColumns = tabling.columns.filterRealColumns(cs);
        if (realColumns.length !== 0) {
          return util.replaceInArray<Table.Column<R, M>>(
            cs,
            (c: Table.Column<R, M>) =>
              tabling.columns.isRealColumn(c) &&
              tabling.columns.normalizedField<R, M>(c) === tabling.columns.normalizedField<R, M>(realColumns[0]),
            { ...realColumns[0], pinned: "left" }
          );
        }
        return cs;
      };

      let cols = tabling.columns.orderColumns(props.columns);
      cols = props.pinFirstColumn ? pinFirstColumn(cols) : cols;

      if (hasEditColumn === true) {
        return [
          genericColumns.EditColumn<R, M>(
            {
              pinned: props.pinFirstColumn || props.pinActionColumns ? "left" : undefined,
              /* These are only applicable for the non-footer grids, but it is
								 easier to define them at the top Table level than at the Grid
								 level. */
              cellRendererParams: {
                ...props.editColumn?.cellRendererParams,
                editColumnConfig: props.editColumnConfig
              }
            },
            props.editColumnWidth
          ),
          ...cols
        ];
      }
      return cols;
    }, []);

    return (
      <Component
        {...(props as T & TableConfigurationProps<R, M>)}
        rendered={rendered}
        columns={columns}
        tableApis={_apis}
        hasEditColumn={hasEditColumn}
        tableGridOptions={tableGridOptions}
        hiddenColumns={hiddenColumns}
        onDataGridReady={onDataGridReady}
        onFooterGridReady={onFooterGridReady}
        onPageGridReady={onPageGridReady}
        onFirstDataRendered={onFirstDataRendered}
        changeColumnVisibility={changeColumnVisibility}
      />
    );
  }
  return hoistNonReactStatics(WithConfigureTable, React.memo(Component));
};

export default configureTable;
