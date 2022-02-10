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

import { useClipboard, useCellNavigation } from "../hooks";

type InjectedPublicDataGridProps = {
  readonly getCSVData: (fields?: string[]) => CSVData;
  readonly processCellForClipboard: (params: ProcessCellForExportParams) => string;
  readonly onCellKeyDown: (event: CellKeyDownEvent) => void;
  readonly navigateToNextCell: (params: NavigateToNextCellParams) => Table.CellPosition;
  readonly tabToNextCell: (params: TabToNextCellParams) => Table.CellPosition;
};

export interface PublicizeDataGridProps<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> {
  readonly apis: Table.GridApis | null;
  readonly columns: Table.Column<R, M>[];
  readonly grid: NonNullRef<Table.DataGridInstance>;
}

export type WithPublicDataGridProps<T> = T & InjectedPublicDataGridProps;

const publicizeDataGrid =
  <
    R extends Table.RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    T extends PublicizeDataGridProps<R, M> = PublicizeDataGridProps<R, M>
  >(
    config?: Table.PublicDataGridConfig<R>
  ) =>
  (
    Component:
      | React.ComponentClass<WithPublicDataGridProps<T>, Record<string, unknown>>
      | React.FunctionComponent<WithPublicDataGridProps<T>>
  ): React.FunctionComponent<T> => {
    function WithPublicDataGrid(props: T) {
      const [processCellForClipboard, getCSVData] = useClipboard<R, M>({
        columns: props.columns,
        apis: props.apis
      });
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
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
          const ev = e.event as KeyboardEvent | null | undefined; // AG Grid's Event Object is Wrong
          if (!isNil(ev) && ev.code === "Enter" && !isNil(e.rowIndex)) {
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
    return hoistNonReactStatics(WithPublicDataGrid, React.memo(Component));
  };

export default publicizeDataGrid;
