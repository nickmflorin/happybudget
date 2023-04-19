import React, { useEffect, useRef, useMemo } from "react";

import { CellMouseOverEvent, CellFocusedEvent } from "ag-grid-community";
import classNames from "classnames";
import hoistNonReactStatics from "hoist-non-react-statics";
import { map, isNil, includes } from "lodash";
import { useLocation } from "react-router-dom";
import { Subtract } from "utility-types";

import { tabling, hooks, model, notifications } from "lib";

export type InjectedDataGridProps = {
  readonly id: Table.GridId;
  readonly onCellMouseOver: (e: CellMouseOverEvent) => void;
  readonly onCellFocused: (e: CellFocusedEvent) => void;
};

export type DataGridProps<
  R extends Table.RowData = Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = {
  readonly className?: Table.GeneralClassName;
  readonly rowClass?: Table.RowClassName;
  readonly columns: Table.Column<R, M>[];
  readonly search?: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  readonly editColumnConfig?: Table.EditColumnRowConfig<R, any>[];
  readonly keyListeners?: Table.KeyListener[];
  readonly calculatedCellHasInfo?:
    | boolean
    | ((cell: Table.CellConstruct<Table.ModelRow<R>, Table.CalculatedColumn<R, M>>) => boolean);
  readonly onCalculatedCellInfoClicked?: Table.CalculatedCellProps<R, M>["onInfoClicked"];
  readonly calculatedCellInfoTooltip?: Table.CalculatedCellProps<R, M>["infoTooltip"];
  readonly onBack?: () => void;
  readonly onLeft?: () => void;
  readonly onRight?: () => void;
  readonly onCellFocusChanged?: (params: Table.CellFocusChangedParams<R, M>) => void;
};

export type InternalDataGridProps<
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = DataGridProps<R, M> & {
  readonly apis: Table.GridApis | null;
  readonly hasEditColumn: boolean;
  readonly columns: Table.Column<R, M>[];
  readonly onFirstDataRendered: (e: Table.FirstDataRenderedEvent) => void;
};

const getRowColorDef = <R extends Table.RowData>(row: Table.BodyRow<R>): Table.RowColorDef => {
  if (tabling.rows.isGroupRow(row)) {
    const colorDef = model.budgeting.getGroupColorDefinition(row);
    if (!isNil(colorDef?.color) && !isNil(colorDef?.backgroundColor)) {
      return {
        color: colorDef?.color,
        backgroundColor: colorDef?.backgroundColor,
      };
    } else if (!isNil(colorDef?.backgroundColor)) {
      return {
        backgroundColor: colorDef?.backgroundColor,
      };
    } else if (!isNil(colorDef?.color)) {
      return {
        color: colorDef?.color,
      };
    }
  }
  return {};
};

type HOCProps = Partial<Omit<InjectedDataGridProps, "id">> & Pick<InjectedDataGridProps, "id">;

const DataGrid = <
  T extends HOCProps,
  R extends Table.RowData = Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
>(
  Component: React.FunctionComponent<T>,
): React.FunctionComponent<Subtract<T, HOCProps> & InternalDataGridProps<R, M>> => {
  function WithDataGrid(props: Subtract<T, HOCProps> & InternalDataGridProps<R, M>) {
    const oldFocusedEvent = useRef<CellFocusedEvent | null>(null);
    const location = useLocation();

    const columns = useMemo<Table.Column<R, M>[]>(
      (): Table.Column<R, M>[] =>
        map(
          map(props.columns, (col: Table.Column<R, M>) =>
            tabling.columns.isRealColumn(col)
              ? {
                  ...col,
                  cellRendererParams: { ...col.cellRendererParams, getRowColorDef },
                }
              : col,
          ),
          (col: Table.Column<R, M>) =>
            tabling.columns.isCalculatedColumn(col)
              ? {
                  ...col,
                  cellRendererParams: {
                    ...col.cellRendererParams,
                    hasInfo: props.calculatedCellHasInfo,
                    onInfoClicked: props.onCalculatedCellInfoClicked,
                    infoTooltip: props.calculatedCellInfoTooltip,
                  },
                }
              : col,
        ),
      [hooks.useDeepEqualMemo(props.columns)],
    );

    const onFirstDataRendered: (e: Table.FirstDataRenderedEvent) => void = useMemo(
      () =>
        (e: Table.FirstDataRenderedEvent): void => {
          props.onFirstDataRendered(e);

          const handleQuery = (rows: Table.BodyRow<R>[]) => {
            if (rows.length !== 0) {
              e.api.ensureIndexVisible(0);

              const query = new URLSearchParams(location.search);
              const rowId = query.get("row");
              const cols = e.columnApi.getAllColumns();

              const actionColumns = tabling.columns.filterActionColumns(props.columns);

              if (!isNil(cols) && cols.length > actionColumns.length) {
                const firstColumn = cols[actionColumns.length];
                let focusedOnQuery = false;
                if (!isNil(rowId) && !isNaN(parseInt(rowId))) {
                  const node = e.api.getRowNode(String(rowId));
                  if (!isNil(node) && !isNil(node.rowIndex) && !isNil(firstColumn)) {
                    e.api.setFocusedCell(node.rowIndex, firstColumn);
                    focusedOnQuery = true;
                  }
                }
                if (focusedOnQuery === false) {
                  e.api.setFocusedCell(0, firstColumn);
                }
              }
            }
          };
          /*
						At the time of this writing, we are not exactly sure why this is
						happening - but for whatever reason (most like an AG Grid internal
						discrepancy) when migrating to the previous table with CMD + ArrowUp,
						the table initially triggers onFirstDataRendered when there are no
						nodes in the table yet - which is strange.  In order to avoid this
						situation, if we notice that there are no rows in the table when
						this is triggered, we will attempt to handle the query 100ms later -
						so that the nodes are populated in the table.
						*/
          let rows: Table.BodyRow<R>[] = tabling.aggrid.getRows(e.api);
          if (rows.length === 0) {
            setTimeout(() => {
              rows = tabling.aggrid.getRows(e.api);
              handleQuery(rows);
            }, 100);
          } else {
            handleQuery(rows);
          }
        },
      [hooks.useDeepEqualMemo(props.columns), props.onFirstDataRendered],
    );

    const getRowClass: Table.GetRowClassName = useMemo(
      () => (params: Table.RowClassParams) => {
        const row: Table.BodyRow<R> = params.node.data;
        if (tabling.rows.isGroupRow(row)) {
          return classNames("row--data", "row--group", props.rowClass);
        }
        return classNames("row--data", props.rowClass);
      },
      [props.rowClass],
    );

    const getRowStyle: Table.GetRowStyle = useMemo(
      () =>
        (params: Table.RowClassParams): Table.RowColorDef => {
          const row: Table.BodyRow<R> = params.node.data;
          return getRowColorDef(row);
        },
      [],
    );

    const onCellFocused: (e: CellFocusedEvent) => void = hooks.useDynamicCallback(
      (e: CellFocusedEvent) => {
        const getCellFromFocusedEvent = (event: CellFocusedEvent): Table.Cell<R, M> | null => {
          if (!isNil(props.apis) && !isNil(event.rowIndex) && !isNil(event.column)) {
            const rowNode: Table.RowNode | undefined = props.apis.grid.getDisplayedRowAtIndex(
              event.rowIndex,
            );
            const column = tabling.columns.getRealColumn(columns, event.column.getColId());
            if (!isNil(rowNode) && !isNil(column)) {
              const row: Table.BodyRow<R> = rowNode.data;
              return { rowNode, column, row };
            }
          }
          return null;
        };

        const cellsTheSame = (cell1: Table.Cell<R, M>, cell2: Table.Cell<R, M>): boolean =>
          tabling.columns.normalizedField<R, M>(cell1.column) ===
            tabling.columns.normalizedField<R, M>(cell2.column) && cell1.row.id === cell2.row.id;

        if (!isNil(e.column) && !isNil(props.apis)) {
          const previousFocusEvent = !isNil(oldFocusedEvent.current)
            ? { ...oldFocusedEvent.current }
            : null;
          oldFocusedEvent.current = e;

          const col: Table.RealColumn<R, M> | null = tabling.columns.getRealColumn(
            columns,
            e.column.getColId(),
          );
          if (!isNil(col)) {
            const cell: Table.Cell<R, M> | null = getCellFromFocusedEvent(e);
            const previousCell = !isNil(previousFocusEvent)
              ? getCellFromFocusedEvent(previousFocusEvent)
              : null;
            if (!isNil(cell)) {
              if (previousCell === null || !cellsTheSame(cell, previousCell)) {
                if (!isNil(col.onCellFocus)) {
                  col.onCellFocus({ apis: props.apis, cell });
                }
                if (!isNil(props.onCellFocusChanged)) {
                  props.onCellFocusChanged({ apis: props.apis, previousCell, cell });
                }
                if (!isNil(previousCell) && !isNil(col.onCellUnfocus)) {
                  col.onCellUnfocus({ apis: props.apis, cell: previousCell });
                }
              }
            }
          }
        }
      },
    );

    const onCellMouseOver: (e: CellMouseOverEvent) => void = useMemo(
      () => (e: CellMouseOverEvent) => {
        /*
          In order to hide/show the expand button under certain conditions,
          we always need to refresh the expand column whenever another cell
          is hovered.  We should figure out if there is a way to optimize
          this to only refresh under certain circumstances.
          */
        if (props.hasEditColumn) {
          if (e.colDef.colId === undefined && e.colDef.field === undefined) {
            console.error(
              "Encountered a colDef with both the 'field' and 'colId' attributes " +
                `undefined, colDef=${notifications.objToJson(e.colDef)}`,
            );
          } else if (
            includes(
              map(tabling.columns.filterRealColumns(columns), (col: Table.RealColumn<R, M>) =>
                tabling.columns.normalizedField<R, M>(col),
              ),
              e.colDef.field || e.colDef.colId,
            )
          ) {
            const nodes: Table.RowNode[] = [];
            const firstRow = e.api.getFirstDisplayedRow();
            const lastRow = e.api.getLastDisplayedRow();
            e.api.forEachNodeAfterFilter((node: Table.RowNode, index: number) => {
              if (index >= firstRow && index <= lastRow) {
                nodes.push(node);
              }
            });
            e.api.refreshCells({ force: true, rowNodes: nodes, columns: ["edit"] });
          }
        }
      },
      [],
    );

    useEffect(() => {
      props.apis?.grid.setQuickFilter(props.search);
    }, [props.search]);

    const moveLeftKeyListener = hooks.useDynamicCallback(
      (localApi: Table.GridApi, e: KeyboardEvent) => {
        const ctrlCmdPressed = e.ctrlKey || e.metaKey;
        if (e.key === "ArrowLeft" && ctrlCmdPressed && !isNil(props.onLeft)) {
          e.preventDefault();
          props.onLeft();
        }
      },
    );

    const moveRightKeyListener = hooks.useDynamicCallback(
      (localApi: Table.GridApi, e: KeyboardEvent) => {
        const ctrlCmdPressed = e.ctrlKey || e.metaKey;
        if (e.key === "ArrowRight" && ctrlCmdPressed && !isNil(props.onRight)) {
          e.preventDefault();
          props.onRight();
        }
      },
    );

    const moveDownKeyListener = hooks.useDynamicCallback(
      (localApi: Table.GridApi, e: KeyboardEvent) => {
        const ctrlCmdPressed = e.ctrlKey || e.metaKey;
        if (e.key === "ArrowDown" && ctrlCmdPressed) {
          const focusedRow = tabling.aggrid.getFocusedRow<R>(localApi);
          if (
            !isNil(focusedRow) &&
            !isNil(props.editColumnConfig) &&
            !tabling.rows.isPlaceholderRow(focusedRow)
          ) {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
            const expandConfig = tabling.columns.getEditColumnRowConfig<R>(
              props.editColumnConfig,
              focusedRow,
              "expand",
            );
            if (!isNil(expandConfig)) {
              expandConfig.action(focusedRow, false);
            }
          }
        }
      },
    );

    const moveUpKeyListener = hooks.useDynamicCallback(
      (localApi: Table.GridApi, e: KeyboardEvent) => {
        const ctrlCmdPressed = e.ctrlKey || e.metaKey;
        if (e.key === "ArrowUp" && ctrlCmdPressed) {
          e.preventDefault();
          props.onBack?.();
        }
      },
    );

    return (
      <Component
        {...(props as T & InternalDataGridProps<R, M>)}
        id="data"
        columns={columns}
        keyListeners={[
          ...(props.keyListeners || []),
          moveDownKeyListener,
          moveUpKeyListener,
          moveLeftKeyListener,
          moveRightKeyListener,
        ]}
        className={classNames("grid--data", props.className)}
        domLayout="autoHeight"
        rowSelection="multiple"
        rowClass={getRowClass}
        getRowStyle={getRowStyle}
        onFirstDataRendered={onFirstDataRendered}
        onCellFocused={onCellFocused}
        onCellMouseOver={onCellMouseOver}
      />
    );
  }
  return hoistNonReactStatics(WithDataGrid, React.memo(Component));
};

export default DataGrid;
