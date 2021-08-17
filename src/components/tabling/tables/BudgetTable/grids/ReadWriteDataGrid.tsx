import { useImperativeHandle } from "react";
import { map, isNil, find } from "lodash";

import { hooks, tabling } from "lib";
import {
  ReadWriteGrid,
  ReadWriteGridProps,
  DataGrid,
  DataGridProps,
  ReadWriteDataGrid,
  ReadWriteDataGridProps
} from "components/tabling/generic";

import BudgetDataGrid, { BudgetDataGridProps } from "./makeDataGrid";

export type ReadWriteBudgetDataGridProps<R extends BudgetTable.Row = any, M extends Model.Model = any> = DataGridProps<
  R,
  M
> &
  ReadWriteDataGridProps<R, M> &
  Omit<ReadWriteGridProps<R, M>, "id"> &
  BudgetDataGridProps<R, M> & {
    readonly tableRef?: NonNullRef<BudgetTable.ReadWriteTableRefObj<R, M>>;
    readonly defaultRowLabel?: string;
    readonly defaultRowName?: string;
    readonly onGroupRows: (rows: R[]) => void;
    readonly isCellEditable?: (params: Table.EditableCallbackParams<R, M>) => boolean;
  };

const DG = DataGrid<ReadWriteBudgetDataGridProps>({
  refreshRowExpandColumnOnCellHover: (row: BudgetTable.Row) => row.meta.isGroupRow !== true
})(ReadWriteGrid);
const DGW = ReadWriteDataGrid<ReadWriteBudgetDataGridProps>({
  includeRowInNavigation: (row: BudgetTable.Row) => row.meta.isGroupRow !== true,
  rowCanDelete: (row: BudgetTable.Row) => row.meta.isGroupRow !== true
})(DG);
const BudgetGrid = BudgetDataGrid<ReadWriteBudgetDataGridProps>(DGW);

function ReadWriteBudgetDataGrid<R extends BudgetTable.Row, M extends Model.Model>(
  props: ReadWriteBudgetDataGridProps<R, M>
) {
  const tableRef = tabling.hooks.useReadWriteBudgetTableIfNotDefined(props.tableRef);

  useImperativeHandle(tableRef, () => ({
    ...tableRef.current,
    applyGroupColorChange: (group: Model.Group) => {
      if (!isNil(props.apis)) {
        const node: Table.RowNode | undefined = props.apis.grid.getRowNode(`group-${group.id}`);
        if (!isNil(node)) {
          props.apis.grid.redrawRows({ rowNodes: [node] });
        }
      }
    }
  }));

  /**
   * Starting at the provided node, traverses the table upwards and collects
   * all of the RowNode(s) until a RowNode that is the footer for a group above
   * the provided node is reached.
   */
  const findRowsUpUntilFirstGroupFooterRow = hooks.useDynamicCallback((node: Table.RowNode): Table.RowNode[] => {
    const nodes: Table.RowNode[] = [node];
    if (!isNil(props.apis)) {
      let currentNode: Table.RowNode | undefined = node;
      while (!isNil(currentNode) && !isNil(currentNode.rowIndex) && currentNode.rowIndex >= 1) {
        currentNode = props.apis.grid.getDisplayedRowAtIndex(currentNode.rowIndex - 1);
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

  const getContextMenuItems = hooks.useDynamicCallback((row: R, node: Table.RowNode): Table.MenuItemDef[] => {
    const contextMenuItems = props.getContextMenuItems?.(row, node) || [];

    const fullRowLabel =
      tabling.util.getFullRowLabel(row, {
        name: props.defaultRowName,
        label: props.defaultRowLabel
      }) || "Row";

    if (row.meta.isGroupRow === true) {
      const group: Model.Group | undefined = find(props.groups, { id: row.meta.group } as any);
      /* eslint-disable indent */
      return !isNil(group)
        ? [
            ...contextMenuItems,
            {
              name: `Ungroup ${group.name}`,
              action: () =>
                props.onChangeEvent({
                  type: "groupDelete",
                  payload: group.id
                })
            }
          ]
        : contextMenuItems;
    } else if (!isNil(row.meta.group)) {
      const group: Model.Group | undefined = find(props.groups, { id: row.meta.group } as any);
      return !isNil(group)
        ? [
            ...contextMenuItems,
            {
              name: `Remove ${fullRowLabel} from Group ${group.name}`,
              action: () =>
                props.onChangeEvent({
                  type: "rowRemoveFromGroup",
                  payload: { columns: props.columns, rows: row, group: group.id }
                })
            }
          ]
        : [];
    } else {
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
        contextMenuItems.push({
          name: label,
          action: () => props.onGroupRows(map(groupableNodesAbove, (n: Table.RowNode) => n.data as R))
        });
      }
      if (props.groups.length !== 0) {
        contextMenuItems.push({
          name: "Add to Group",
          subMenu: map(props.groups, (group: Model.Group) => ({
            name: group.name,
            action: () =>
              props.onChangeEvent({
                type: "rowAddToGroup",
                payload: { columns: props.columns, rows: row, group: group.id }
              })
          }))
        });
      }
      return contextMenuItems;
    }
  });
  return <BudgetGrid {...props} getContextMenuItems={getContextMenuItems} />;
}

export default ReadWriteBudgetDataGrid;
