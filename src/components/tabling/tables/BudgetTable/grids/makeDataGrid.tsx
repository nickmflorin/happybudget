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
  readonly editColumnConfig?: Table.EditColumnRowConfig<R>[];
  readonly onBack?: () => void;
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
        const focusedRow = tabling.aggrid.getFocusedRow<R>(localApi);
        if (!isNil(focusedRow) && !isNil(props.editColumnConfig) && !tabling.typeguards.isPlaceholderRow(focusedRow)) {
          const expandConfig = tabling.columns.getEditColumnRowConfig<R>(props.editColumnConfig, focusedRow, "expand");
          if (!isNil(expandConfig)) {
            expandConfig.action(focusedRow, false);
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
      const instantiatedListeners: ((e: KeyboardEvent) => void)[] = [];
      const keyListeners = [moveDownKeyListener, moveUpKeyListener];
      const apis: Table.GridApis | null = props.apis;
      if (!isNil(apis)) {
        for (let i = 0; i < keyListeners.length; i++) {
          const listener = (e: KeyboardEvent) => keyListeners[i](apis.grid, e);
          window.addEventListener("keydown", listener);
          instantiatedListeners.push(listener);
        }
      }
      return () => {
        for (let i = 0; i < instantiatedListeners.length; i++) {
          window.removeEventListener("keydown", instantiatedListeners[i]);
        }
      };
    }, [props.apis]);

    return <Component {...props} framework={tabling.aggrid.combineFrameworks(Framework, props.framework)} />;
  }
  return hoistNonReactStatics(WithBudgetDataGrid, Component);
};

export default BudgetDataGrid;
