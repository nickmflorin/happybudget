import React, { useMemo, useImperativeHandle } from "react";

import {
  ProcessCellForExportParams,
  CellKeyDownEvent,
  NavigateToNextCellParams,
  TabToNextCellParams,
  SuppressKeyboardEventParams,
} from "ag-grid-community";
import hoistNonReactStatics from "hoist-non-react-statics";
import { isNil, map, includes } from "lodash";
import { Subtract } from "utility-types";

import { hooks, tabling } from "lib";

import makeDataGrid, {
  InjectedDataGridProps,
  DataGridProps,
  InternalDataGridProps,
} from "./makeDataGrid";
import { useClipboard, useCellNavigation } from "../hooks";

type InjectedPublicDataGridProps = InjectedDataGridProps & {
  readonly processCellForClipboard: (params: ProcessCellForExportParams) => string;
  readonly onCellKeyDown: (event: CellKeyDownEvent) => void;
  readonly navigateToNextCell: (params: NavigateToNextCellParams) => Table.CellPosition;
  readonly tabToNextCell: (params: TabToNextCellParams) => Table.CellPosition;
};

export type PublicizeDataGridProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
> = DataGridProps<R, M>;

export type InternalPublicizeDataGridProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
> = PublicizeDataGridProps<R, M> &
  InternalDataGridProps<R, M> & {
    readonly grid: NonNullRef<Table.DataGridInstance>;
    readonly columns: Table.Column<R, M>[];
  };

/* We have to use the Partial form of the injected props because these props
   are all optional in the <Grid> component, with the exception of the ID. */
type HOCProps = Partial<Omit<InjectedPublicDataGridProps, "id">> &
  Pick<InjectedPublicDataGridProps, "id">;

const publicizeDataGrid = <
  T extends HOCProps,
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
>(
  Component: React.FunctionComponent<T>,
): React.FunctionComponent<Subtract<T, HOCProps> & InternalPublicizeDataGridProps<R, M>> => {
  const DG = makeDataGrid<T, R, M>(Component);

  function WithPublicDataGrid(props: Subtract<T, HOCProps> & InternalPublicizeDataGridProps<R, M>) {
    const [processCellForClipboard, getCSVData] = useClipboard<R, M>({
      columns: props.columns,
      apis: props.apis,
    });
    const [navigateToNextCell, tabToNextCell, _, moveToNextRow] = useCellNavigation<R, M>({
      apis: props.apis,
      columns: props.columns,
    });

    const columns = useMemo<Table.Column<R, M>[]>(
      (): Table.Column<R, M>[] =>
        tabling.columns.normalizeColumns(
          map(props.columns, (col: Table.Column<R, M>) => ({
            ...col,
            editable: false,
          })),
          {},
          {
            body: (col: Table.BodyColumn<R, M>) => ({
              suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
                if (
                  !isNil(col.suppressKeyboardEvent) &&
                  col.suppressKeyboardEvent(params) === true
                ) {
                  return true;
                } else if (
                  /* We need to suppress CMD + Arrow KeyboardEvent(s) because this
                     is how we navigate through the nested/sibling tables in the
                     BudgetTable case. */
                  includes(["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"], params.event.key) &&
                  (params.event.ctrlKey || params.event.metaKey)
                ) {
                  return true;
                }
                return false;
              },
            }),
          },
        ),
      [hooks.useDeepEqualMemo(props.columns)],
    );

    const onCellKeyDown: (e: Table.CellKeyDownEvent) => void = hooks.useDynamicCallback(
      (e: Table.CellKeyDownEvent) => {
        const ev = e.event as KeyboardEvent | null | undefined; // AG Grid's Event Object is Wrong
        if (!isNil(ev) && ev.code === "Enter" && !isNil(e.rowIndex)) {
          moveToNextRow({ rowIndex: e.rowIndex, column: e.column });
        }
      },
    );

    useImperativeHandle(props.grid, () => ({
      getCSVData,
    }));

    return (
      <DG
        {...(props as T & InternalPublicizeDataGridProps<R, M>)}
        columns={columns}
        processCellForClipboard={processCellForClipboard}
        getCSVData={getCSVData}
        onCellKeyDown={onCellKeyDown}
        navigateToNextCell={navigateToNextCell}
        tabToNextCell={tabToNextCell}
      />
    );
  }
  return hoistNonReactStatics(WithPublicDataGrid, React.memo(Component));
};

export default publicizeDataGrid;
