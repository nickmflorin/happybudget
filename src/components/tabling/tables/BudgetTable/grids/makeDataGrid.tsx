import { useEffect, useMemo } from "react";
import { map, isNil, find, filter, reduce } from "lodash";
import hoistNonReactStatics from "hoist-non-react-statics";

import { GridApi, RowClassParams } from "@ag-grid-community/core";

import { hooks, model, tabling } from "lib";
import { Framework } from "../framework";

interface InjectedBudgetDataGridProps<R extends BudgetTable.Row> {
  readonly data?: R[];
  readonly getRowClass?: Table.GetRowClassName;
  readonly getRowStyle?: Table.GetRowStyle;
}

export interface BudgetDataGridProps<R extends BudgetTable.Row = any, M extends Model.Model = any> {
  readonly apis: Table.GridApis | null;
  readonly columns: Table.Column<R, M>[];
  readonly models: M[];
  readonly groups: Model.Group[];
  readonly levelType: BudgetTable.LevelType;
  readonly budgetType: Model.BudgetType;
  readonly framework?: Table.Framework;
  readonly getRowName?: number | string | ((m: M) => number | string | null);
  readonly getRowLabel?: number | string | ((m: M) => number | string | null);
  readonly getRowChildren: (m: M) => number[];
  readonly onBack?: () => void;
  readonly rowCanExpand?: (row: R) => boolean;
  readonly onRowExpand?: null | ((id: number) => void);
}

export type WithBudgetDataGridProps<T, R extends BudgetTable.Row> = T & InjectedBudgetDataGridProps<R>;

/* eslint-disable indent */
const BudgetDataGrid = <
  T extends BudgetDataGridProps<R, M> = BudgetDataGridProps<any, any>,
  R extends BudgetTable.Row = any,
  M extends Model.Model = any
>(
  Component:
    | React.ComponentClass<WithBudgetDataGridProps<T, R>, {}>
    | React.FunctionComponent<WithBudgetDataGridProps<T, R>>
): React.FunctionComponent<T> => {
  function WithBudgetDataGrid(props: T) {
    const getRowClass: Table.GetRowClassName = hooks.useDynamicCallback((params: RowClassParams) => {
      const row: R = params.node.data;
      if (row.meta.isGroupRow === true) {
        return "row--group";
      }
      return "";
    });

    const getRowStyle: Table.GetRowStyle = hooks.useDynamicCallback(
      (params: RowClassParams): { [key: string]: any } => {
        const row: R = params.node.data;
        if (row.meta.isGroupRow === true) {
          if (isNil(row.meta.group)) {
            /* eslint-disable no-console */
            console.error(`Row ${row.id} is defined as a group row but does not define a group ID!`);
            return {};
          }
          const group: Model.Group | undefined = find(props.groups, { id: row.meta.group } as any);
          if (isNil(group)) {
            return {};
          }
          const colorDef = model.util.getGroupColorDefinition(group);
          if (!isNil(colorDef.color) && !isNil(colorDef.backgroundColor)) {
            return {
              color: `${colorDef.color}`,
              backgroundColor: `${colorDef.backgroundColor}`
            };
          } else if (!isNil(colorDef.backgroundColor)) {
            return {
              backgroundColor: `${colorDef.backgroundColor}`
            };
          } else if (!isNil(colorDef.color)) {
            return {
              color: `${colorDef.color}`
            };
          }
        }
        return {};
      }
    );

    const convertedData: R[] = useMemo<R[]>((): R[] => {
      const readColumns = filter(props.columns, (c: Table.Column<R, M>) => c.isRead !== false);

      const createGroupRow = (group: Model.Group): R | null => {
        if (readColumns.length !== 0) {
          return reduce(
            readColumns,
            (obj: { [key: string]: any }, col: Table.Column<R, M>) => {
              if (col.tableColumnType === "calculated") {
                if (!isNil(group[col.field as keyof Model.Group])) {
                  obj[col.field as string] = group[col.field as keyof Model.Group];
                } else {
                  obj[col.field as string] = null;
                }
              } else {
                obj[col.field as string] = null;
              }
              return obj;
            },
            {
              // The ID needs to designate that this row refers to a Group because the ID of a Group
              // might clash with the ID of a SubAccount/Account.
              id: `group-${group.id}`,
              [readColumns[0].field as string]: group.name,
              meta: { group: group.id, isGroupRow: true }
            }
          ) as R;
        }
        return null;
      };

      const tableData = tabling.util.createBudgetTableData<Table.Column<R, M>, R, M>(
        readColumns,
        props.models,
        props.groups,
        {
          defaultNullValue: null,
          // ordering: props.ordering,
          getRowMeta: (m: M) => ({
            gridId: "data",
            children: props.getRowChildren(m),
            name: !isNil(props.getRowName)
              ? typeof props.getRowName === "function"
                ? props.getRowName(m)
                : props.getRowName
              : null,
            label: !isNil(props.getRowLabel)
              ? typeof props.getRowLabel === "function"
                ? props.getRowLabel(m)
                : props.getRowLabel
              : null
          })
        }
      );
      return reduce(
        tableData,
        (rows: R[], rowGroup: BudgetTable.RowGroup<R, M>) => {
          let newRows: R[] = [...rows, ...map(rowGroup.rows, (row: Table.ModelWithRow<R, M>) => row.row)];
          if (!isNil(rowGroup.group)) {
            const groupRow: R | null = createGroupRow(rowGroup.group);
            if (!isNil(groupRow)) {
              newRows = [...newRows, groupRow];
            }
          }
          return newRows;
        },
        []
      );
    }, [hooks.useDeepEqualMemo(props.models), hooks.useDeepEqualMemo(props.groups)]);

    const moveDownKeyListener = hooks.useDynamicCallback((localApi: GridApi, e: KeyboardEvent) => {
      const ctrlCmdPressed = e.ctrlKey || e.metaKey;
      if (e.key === "ArrowDown" && ctrlCmdPressed) {
        const focusedCell = localApi.getFocusedCell();
        if (!isNil(focusedCell)) {
          const node = localApi.getDisplayedRowAtIndex(focusedCell.rowIndex);
          if (!isNil(node)) {
            const row: R = node.data;
            if (!isNil(props.onRowExpand) && (isNil(props.rowCanExpand) || props.rowCanExpand(row))) {
              props.onRowExpand(row.id);
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

    return (
      <Component
        {...props}
        rowClass={getRowClass}
        getRowStyle={getRowStyle}
        data={convertedData}
        framework={tabling.util.combineFrameworks(Framework, props.framework)}
        columns={map(props.columns, (col: Table.Column<R, M>) => ({
          ...col,
          cellRendererParams: {
            ...col.cellRendererParams,
            levelType: props.levelType,
            budgetType: props.budgetType
          },
          cellEditorParams: {
            ...col.cellEditorParams,
            levelType: props.levelType,
            budgetType: props.budgetType
          }
        }))}
      />
    );
  }
  return hoistNonReactStatics(WithBudgetDataGrid, Component);
};

export default BudgetDataGrid;
