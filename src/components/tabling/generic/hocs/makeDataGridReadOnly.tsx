import { useMemo } from "react";
import { isNil, map } from "lodash";
import hoistNonReactStatics from "hoist-non-react-statics";

import { CellKeyDownEvent, NavigateToNextCellParams, TabToNextCellParams } from "@ag-grid-community/core";

import { hooks } from "lib";

import { useCellNavigation } from "./hooks";

type InjectedReadOnlyDataGridProps = {
  readonly onCellKeyDown?: (event: CellKeyDownEvent) => void;
  readonly navigateToNextCell?: (params: NavigateToNextCellParams) => Table.CellPosition;
  readonly tabToNextCell?: (params: TabToNextCellParams) => Table.CellPosition;
};

export interface ReadOnlyDataGridProps<R extends Table.Row, M extends Model.Model> {
  readonly apis: Table.GridApis | null;
  readonly columns: Table.Column<R, M>[];
}

export type WithReadOnlyDataGridProps<T> = T & InjectedReadOnlyDataGridProps;

/* eslint-disable indent */
const ReadOnlyDataGrid =
  <
    T extends ReadOnlyDataGridProps<R, M> = ReadOnlyDataGridProps<any, any>,
    R extends Table.Row = any,
    M extends Model.Model = any
  >(
    config?: TableUi.ReadOnlyDataGridConfig<R>
  ) =>
  (
    Component:
      | React.ComponentClass<WithReadOnlyDataGridProps<T>, {}>
      | React.FunctionComponent<WithReadOnlyDataGridProps<T>>
  ): React.FunctionComponent<T> => {
    function WithReadOnlyDataGrid(props: T) {
      /* eslint-disable no-unused-vars */
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const [navigateToNextCell, tabToNextCell, _, moveToNextRow] = useCellNavigation({
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

      return (
        <Component
          {...props}
          columns={columns}
          onCellKeyDown={onCellKeyDown}
          navigateToNextCell={navigateToNextCell}
          tabToNextCell={tabToNextCell}
        />
      );
    }
    return hoistNonReactStatics(WithReadOnlyDataGrid, Component);
  };

export default ReadOnlyDataGrid;
