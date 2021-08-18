import { useState, useEffect, useImperativeHandle } from "react";
import { map, isNil, includes, find, filter, reduce } from "lodash";

import { GridApi, RowNode, RowClassParams, MenuItemDef } from "@ag-grid-community/core";

import { hooks, model, tabling } from "lib";

import { DataGrid, DataGridProps } from "components/tabling/generic";

export interface BudgetDataGridProps<R extends BudgetTable.Row, M extends Model.Model>
  extends Omit<DataGridProps<R, M>, "data"> {
  readonly grid?: BudgetTable.GridRef<R, M>;
  readonly data: M[];
  readonly groups: Model.Group[];
  readonly levelType: BudgetTable.LevelType;
  readonly budgetType: Model.BudgetType;
  readonly onGroupRows: (rows: R[]) => void;
  readonly onBack?: () => void;
  readonly getRowName?: number | string | ((m: M) => number | string | null);
  readonly getRowChildren: (m: M) => number[];
  readonly getRowLabel?: number | string | ((m: M) => number | string | null);
}

const BudgetDataGrid = <R extends BudgetTable.Row, M extends Model.Model>({
  apis,
  grid,
  data,
  groups,
  columns,
  levelType,
  budgetType,
  getRowName,
  getRowLabel,
  onGroupRows,
  getRowChildren,
  onBack,
  ...props
}: BudgetDataGridProps<R, M>): JSX.Element => {
  const genericGrid = tabling.hooks.useGrid<R, M>();
  const [table, setTable] = useState<R[]>([]);

  const getRowClass = hooks.useDynamicCallback((params: RowClassParams) => {
    const row: R = params.node.data;
    if (row.meta.isGroupRow === true) {
      return "row--group";
    }
    return "";
  });

  const getRowStyle = hooks.useDynamicCallback((params: RowClassParams) => {
    const row: R = params.node.data;
    if (row.meta.isGroupRow === true) {
      if (isNil(row.meta.group)) {
        /* eslint-disable no-console */
        console.error(`Row ${row.id} is defined as a group row but does not define a group ID!`);
        return {};
      }
      const group: Model.Group | undefined = find(groups, { id: row.meta.group } as any);
      if (isNil(group)) {
        return {};
      }
      const colorDef = model.util.getGroupColorDefinition(group);
      return {
        color: !isNil(colorDef.color) ? `${colorDef.color} !important` : undefined,
        backgroundColor: !isNil(colorDef.backgroundColor) ? `${colorDef.backgroundColor} !important` : undefined
      };
    }
  });

  /**
   * Starting at the provided node, traverses the table upwards and collects
   * all of the RowNode(s) until a RowNode that is the footer for a group above
   * the provided node is reached.
   */
  const findRowsUpUntilFirstGroupFooterRow = hooks.useDynamicCallback((node: RowNode): RowNode[] => {
    const nodes: RowNode[] = [node];
    if (!isNil(apis)) {
      let currentNode: RowNode | null = node;
      while (!isNil(currentNode) && !isNil(currentNode.rowIndex) && currentNode.rowIndex >= 1) {
        currentNode = apis.grid.getDisplayedRowAtIndex(currentNode.rowIndex - 1);
        if (!isNil(currentNode)) {
          const row: R = currentNode.data;
          if (row.meta.isGroupRow === true) {
            break;
          } else {
            // NOTE: In practice, we will never reach a non-group footer node that belongs to a group
            // before we reach the group footer node, so as long as the ordering/grouping of rows
            // is consistent.  However, we will also make sure that the row does not belong to a group
            // for safety.
            if (isNil(row.group)) {
              nodes.push(currentNode);
            }
          }
        }
      }
    }
    return nodes;
  });

  const getContextMenuItems = hooks.useDynamicCallback(
    (row: R, node: RowNode, onChangeEvent: Table.OnChangeEvent<R, M>): MenuItemDef[] => {
      const fullRowLabel =
        tabling.util.getFullRowLabel(row, {
          name: props.defaultRowName,
          label: props.defaultRowLabel
        }) || "Row";

      if (row.meta.isGroupRow === true) {
        const group: Model.Group | undefined = find(groups, { id: row.meta.group } as any);
        /* eslint-disable indent */
        return !isNil(group)
          ? [
              {
                name: `Ungroup ${group.name}`,
                action: () =>
                  onChangeEvent({
                    type: "groupDelete",
                    payload: group.id
                  })
              }
            ]
          : [];
      } else if (!isNil(row.meta.group)) {
        const group: Model.Group | undefined = find(groups, { id: row.meta.group } as any);
        return !isNil(group)
          ? [
              {
                name: `Remove ${fullRowLabel} from Group ${group.name}`,
                action: () =>
                  onChangeEvent({
                    type: "rowRemoveFromGroup",
                    payload: { columns, rows: row, group: group.id }
                  })
              }
            ]
          : [];
      } else {
        const menuItems: MenuItemDef[] = [];
        const groupableNodesAbove = findRowsUpUntilFirstGroupFooterRow(node);
        if (groupableNodesAbove.length !== 0) {
          let label: string;
          if (groupableNodesAbove.length === 1) {
            label = `Group ${fullRowLabel}`;
          } else {
            label = `Group ${row.meta.name || props.defaultRowName || "Row"}s`;
            if (
              !isNil(groupableNodesAbove[groupableNodesAbove.length - 1].data.meta.label) &&
              !isNil(groupableNodesAbove[0].data.meta.label)
            ) {
              label = `Group ${row.meta.name || props.defaultRowName || "Row"}s ${
                groupableNodesAbove[groupableNodesAbove.length - 1].data.meta.label
              } - ${groupableNodesAbove[0].data.meta.label}`;
            }
          }
          menuItems.push({
            name: label,
            action: () => onGroupRows(map(groupableNodesAbove, (n: RowNode) => n.data as R))
          });
        }
        if (groups.length !== 0) {
          menuItems.push({
            name: "Add to Group",
            subMenu: map(groups, (group: Model.Group) => ({
              name: group.name,
              action: () =>
                onChangeEvent({
                  type: "rowAddToGroup",
                  payload: { columns, rows: row, group: group.id }
                })
            }))
          });
        }
        return menuItems;
      }
    }
  );

  useEffect(() => {
    const readColumns = filter(columns, (c: Table.Column<R, M>) => {
      const fieldBehavior: Table.FieldBehavior[] = c.fieldBehavior || ["read", "write"];
      return includes(fieldBehavior, "read");
    });

    const createGroupRow = (group: Model.Group): R | null => {
      if (readColumns.length !== 0) {
        return reduce(
          columns,
          (obj: { [key: string]: any }, col: Table.Column<R, M>) => {
            const fieldBehavior: Table.FieldBehavior[] = col.fieldBehavior || ["read", "write"];
            if (includes(fieldBehavior, "read")) {
              if (!isNil(col.field)) {
                if (col.isCalculated === true) {
                  if (!isNil(group[col.field as keyof Model.Group])) {
                    obj[col.field as string] = group[col.field as keyof Model.Group];
                  } else {
                    obj[col.field as string] = null;
                  }
                } else {
                  obj[col.field as string] = null;
                }
              }
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

    const tableData = tabling.util.createBudgetTableData<Table.Column<R, M>, R, M>(readColumns, data, groups, {
      defaultNullValue: null,
      // ordering: props.ordering,
      getRowMeta: (m: M) => ({
        gridId: "data",
        children: getRowChildren(m),
        name: !isNil(getRowName) ? (typeof getRowName === "function" ? getRowName(m) : getRowName) : null,
        label: !isNil(getRowLabel) ? (typeof getRowLabel === "function" ? getRowLabel(m) : getRowLabel) : null
      })
    });
    setTable(
      reduce(
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
      )
    );
  }, [hooks.useDeepEqualMemo(data), hooks.useDeepEqualMemo(groups)]);

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
      !isNil(onBack) && onBack();
    }
  });

  useEffect(() => {
    const keyListeners = [moveDownKeyListener, moveUpKeyListener];
    if (!isNil(apis)) {
      const instantiatedListeners: ((e: KeyboardEvent) => void)[] = [];
      for (let i = 0; i < keyListeners.length; i++) {
        const listener = (e: KeyboardEvent) => keyListeners[i](apis.grid, e);
        window.addEventListener("keydown", listener);
        instantiatedListeners.push(listener);
      }
      return () => {
        for (let i = 0; i < instantiatedListeners.length; i++) {
          window.removeEventListener("keydown", instantiatedListeners[i]);
        }
      };
    }
  }, [apis]);

  useImperativeHandle(grid, () => ({
    applyTableChange: genericGrid.current.applyTableChange,
    getCSVData: genericGrid.current.getCSVData,
    applyGroupColorChange: (group: Model.Group) => {
      if (!isNil(apis)) {
        const node: RowNode | null = apis.grid.getRowNode(`group-${group.id}`);
        if (!isNil(node)) {
          apis.grid.redrawRows({ rowNodes: [node] });
        }
      }
    }
  }));

  return (
    <DataGrid<R, M>
      {...props}
      apis={apis}
      grid={genericGrid}
      columns={map(columns, (col: Table.Column<R, M>) => ({
        ...col,
        cellRendererParams: {
          ...col.cellRendererParams,
          levelType,
          budgetType
        },
        cellEditorParams: {
          ...col.cellEditorParams,
          levelType,
          budgetType
        }
      }))}
      getContextMenuItems={getContextMenuItems}
      data={table}
      rowClass={getRowClass}
      getRowStyle={getRowStyle}
      rowCanDelete={(row: R) => row.meta.isGroupRow !== true}
      includeRowInNavigation={(row: R) => row.meta.isGroupRow !== true}
      refreshRowExpandColumnOnCellHover={(row: R) => row.meta.isGroupRow !== true}
      rowHasCheckboxSelection={(row: R) => row.meta.isGroupRow !== true}
    />
  );
};

export default BudgetDataGrid;
