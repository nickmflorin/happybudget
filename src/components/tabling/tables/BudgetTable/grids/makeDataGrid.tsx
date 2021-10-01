import { useEffect } from "react";
import { isNil } from "lodash";
import hoistNonReactStatics from "hoist-non-react-statics";

import { GridApi } from "@ag-grid-community/core";

import { hooks, tabling } from "lib";
import { Framework } from "../framework";

interface InjectedBudgetDataGridProps {
  readonly framework?: Table.Framework;
}

export interface BudgetDataGridProps<R extends Table.RowData> {
  readonly apis: Table.GridApis | null;
  readonly framework?: Table.Framework;
  readonly onBack?: () => void;
  readonly rowCanExpand?: boolean | ((row: Table.ModelRow<R>) => boolean);
  readonly onRowExpand?: (row: Table.ModelRow<R>) => void;
}

export type WithBudgetDataGridProps<T> = T & InjectedBudgetDataGridProps;

/* eslint-disable indent */
const BudgetDataGrid = <R extends Tables.BudgetRowData, T extends BudgetDataGridProps<R> = BudgetDataGridProps<R>>(
  Component: React.ComponentClass<WithBudgetDataGridProps<T>, {}> | React.FunctionComponent<WithBudgetDataGridProps<T>>
): React.FunctionComponent<T> => {
  function WithBudgetDataGrid(props: T) {
    const moveDownKeyListener = hooks.useDynamicCallback((localApi: GridApi, e: KeyboardEvent) => {
      const ctrlCmdPressed = e.ctrlKey || e.metaKey;
      if (e.key === "ArrowDown" && ctrlCmdPressed) {
        const focusedCell = localApi.getFocusedCell();
        if (!isNil(focusedCell)) {
          const node = localApi.getDisplayedRowAtIndex(focusedCell.rowIndex);
          if (!isNil(node)) {
            const row: Table.BodyRow<R> = node.data;
            if (
              tabling.typeguards.isModelRow(row) &&
              !isNil(props.onRowExpand) &&
              (isNil(props.rowCanExpand) ||
                (typeof props.rowCanExpand === "boolean" && props.rowCanExpand !== false) ||
                (typeof props.rowCanExpand === "function" && props.rowCanExpand(row)))
            ) {
              props.onRowExpand(row);
            }
          }
        }
      }
    });

    const moveUpKeyListener = hooks.useDynamicCallback((localApi: GridApi, e: KeyboardEvent) => {
      const ctrlCmdPressed = e.ctrlKey || e.metaKey;
      if (e.key === "ArrowUp" && ctrlCmdPressed) {
        !isNil(props.onBack) && props.onBack();
      }
    });

    useEffect(() => {
      const keyListeners = [moveDownKeyListener, moveUpKeyListener];
      const gridApi = props.apis?.grid;
      if (!isNil(gridApi)) {
        const instantiatedListeners: ((e: KeyboardEvent) => void)[] = [];
        for (let i = 0; i < keyListeners.length; i++) {
          const listener = (e: KeyboardEvent) => keyListeners[i](gridApi, e);
          window.addEventListener("keydown", listener);
          instantiatedListeners.push(listener);
        }
        return () => {
          for (let i = 0; i < instantiatedListeners.length; i++) {
            window.removeEventListener("keydown", instantiatedListeners[i]);
          }
        };
      }
    }, [props.apis]);

    return <Component {...props} framework={tabling.aggrid.combineFrameworks(Framework, props.framework)} />;
  }
  return hoistNonReactStatics(WithBudgetDataGrid, Component);
};

export default BudgetDataGrid;
