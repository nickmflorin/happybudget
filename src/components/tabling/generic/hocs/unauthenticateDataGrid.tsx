import React, { useMemo, useImperativeHandle } from "react";
import { isNil, map } from "lodash";
import hoistNonReactStatics from "hoist-non-react-statics";

import {
  ProcessCellForExportParams,
  CellKeyDownEvent,
  NavigateToNextCellParams,
  TabToNextCellParams
} from "@ag-grid-community/core";

import { hooks } from "lib";

import useCellNavigation from "./useCellNavigation";
import useClipboard from "./useClipboard";

type InjectedUnauthenticatedDataGridProps<R extends Table.RowData> = {
  readonly getCSVData: (fields?: (keyof R | string)[]) => CSVData;
  readonly processCellForClipboard: (params: ProcessCellForExportParams) => string;
  readonly onCellKeyDown: (event: CellKeyDownEvent) => void;
  readonly navigateToNextCell: (params: NavigateToNextCellParams) => Table.CellPosition;
  readonly tabToNextCell: (params: TabToNextCellParams) => Table.CellPosition;
};

export interface UnauthenticateDataGridProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> {
  readonly apis: Table.GridApis | null;
  readonly columns: Table.Column<R, M>[];
  readonly grid: NonNullRef<Table.DataGridInstance>;
}

export type WithUnauthenticatedDataGridProps<R extends Table.RowData, T> = T & InjectedUnauthenticatedDataGridProps<R>;

/* eslint-disable indent */
const unauthenticatedDataGrid =
  <
    R extends Table.RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    T extends UnauthenticateDataGridProps<R, M> = UnauthenticateDataGridProps<R, M>
  >(
    config?: Table.UnauthenticatedDataGridConfig<R>
  ) =>
  (
    Component:
      | React.ComponentClass<WithUnauthenticatedDataGridProps<R, T>, {}>
      | React.FunctionComponent<WithUnauthenticatedDataGridProps<R, T>>
  ): React.FunctionComponent<T> => {
    function WithUnauthenticatedDataGrid(props: T) {
      const [processCellForClipboard, getCSVData] = useClipboard<R, M>({
        columns: props.columns,
        apis: props.apis
      });
      /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
      const [navigateToNextCell, tabToNextCell, _, moveToNextRow] = useCellNavigation<R, M>({
        apis: props.apis,
        columns: props.columns,
        includeRowInNavigation: config?.includeRowInNavigation
      });

      const columns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
        return map(props.columns, (col: Table.Column<R, M>) => ({
          ...col,
          editable: false
        }));
      }, [hooks.useDeepEqualMemo(props.columns)]);

      const onCellKeyDown: (e: Table.CellKeyDownEvent) => void = hooks.useDynamicCallback(
        (e: Table.CellKeyDownEvent) => {
          /* @ts-ignore  AG Grid's Event Object is Wrong */
          if (!isNil(e.e) & (e.e.code === "Enter") && !isNil(e.rowIndex)) {
            moveToNextRow({ rowIndex: e.rowIndex, column: e.column });
          }
        }
      );

      useImperativeHandle(props.grid, () => ({
        getCSVData
      }));

      return (
        <Component
          {...props}
          columns={columns}
          processCellForClipboard={processCellForClipboard}
          getCSVData={getCSVData}
          onCellKeyDown={onCellKeyDown}
          navigateToNextCell={navigateToNextCell}
          tabToNextCell={tabToNextCell}
        />
      );
    }
    return hoistNonReactStatics(WithUnauthenticatedDataGrid, React.memo(Component));
  };

export default unauthenticatedDataGrid;
