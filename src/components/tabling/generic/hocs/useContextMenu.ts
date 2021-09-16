import { useMemo } from "react";
import { map, isNil, includes, find } from "lodash";

import { tabling, hooks } from "lib";

export type UseContextMenuParams<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
> = {
  readonly apis: Table.GridApis | null;
  // readonly tableId: Table.Id;
  // readonly columns: Table.Column<R, M, G>[];
  readonly data: Table.Row<R, M>[];
  readonly defaultRowLabel?: string;
  readonly defaultRowName?: string;
  readonly onChangeEvent: (event: Table.ChangeEvent<R, M, G>) => void;
  readonly getGroupRowContextMenuItems?: (row: Table.GroupRow<R>, node: Table.RowNode) => Table.MenuItemDef[];
  readonly getDataRowContextMenuItems?: (row: Table.DataRow<R, M>, node: Table.RowNode) => Table.MenuItemDef[];
  readonly rowCanDelete?: (row: Table.DataRow<R, M>) => boolean;
  readonly onGroupRows?: (rows: Table.DataRow<R, M>[]) => void;
};

type GetRowLabel<R extends Table.RowData, M extends Model.Model = Model.Model> = (row: Table.Row<R, M>) => string;

/* eslint-disable indent */
const useContextMenu = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>(
  params: UseContextMenuParams<R, M, G>
): [(row: Table.Row<R, M>, node: Table.RowNode) => Table.MenuItemDef[]] => {
  /**
   * Starting at the provided node, traverses the table upwards and collects
   * all of the RowNode(s) until a RowNode that is the footer for a group above
   * the provided node is reached.
   */
  const findRowsUpUntilFirstGroupFooterRow = hooks.useDynamicCallback((node: Table.RowNode): Table.RowNode[] => {
    const nodes: Table.RowNode[] = [node];
    if (!isNil(params.apis)) {
      let currentNode: Table.RowNode | undefined = node;
      while (!isNil(currentNode) && !isNil(currentNode.rowIndex) && currentNode.rowIndex >= 1) {
        currentNode = params.apis.grid.getDisplayedRowAtIndex(currentNode.rowIndex - 1);
        if (!isNil(currentNode)) {
          const row: Table.Row<R, M> = currentNode.data;
          if (tabling.typeguards.isGroupRow(row)) {
            break;
          } else {
            nodes.push(currentNode);
          }
        }
      }
    }
    return nodes;
  });

  const getRowLabel = useMemo<GetRowLabel<R, M>>(() => {
    return (row: Table.Row<R, M>) =>
      tabling.rows.getFullRowLabel(row, {
        name: params.defaultRowName,
        label: params.defaultRowLabel
      }) || "Row";
  }, [params.defaultRowName, params.defaultRowLabel]);

  const getDataRowGroupContextMenuItems: (row: Table.DataRow<R, M>, node: Table.RowNode) => Table.MenuItemDef[] =
    hooks.useDynamicCallback((row: Table.DataRow<R, M>, node: Table.RowNode): Table.MenuItemDef[] => {
      let contextMenuItems: Table.MenuItemDef[] = [];
      const onGroupRows = params.onGroupRows;
      if (!isNil(onGroupRows)) {
        const groupRow: Table.GroupRow<R> | undefined = find(
          params.data,
          (r: Table.Row<R, M>) => tabling.typeguards.isGroupRow(r) && includes(r.children, row.id)
        ) as Table.GroupRow<R> | undefined;
        if (!isNil(groupRow)) {
          contextMenuItems = [
            ...contextMenuItems,
            {
              name: `Remove ${getRowLabel(row)} from Group ${groupRow.name}`,
              action: () =>
                params.onChangeEvent({
                  type: "rowRemoveFromGroup",
                  payload: { rows: [row.id], group: groupRow.id }
                })
            }
          ];
        } else {
          const groupableNodesAbove = findRowsUpUntilFirstGroupFooterRow(node);
          if (groupableNodesAbove.length !== 0) {
            let label: string;
            if (groupableNodesAbove.length === 1) {
              label = `Group ${getRowLabel(row)}`;
            } else {
              label = `Group ${row.name || params.defaultRowName || "Row"}s`;
              if (
                !isNil(groupableNodesAbove[groupableNodesAbove.length - 1].data.label) &&
                !isNil(groupableNodesAbove[0].data.label)
              ) {
                label = `Group ${row.name || params.defaultRowName || "Row"}s ${
                  groupableNodesAbove[groupableNodesAbove.length - 1].data.label
                } - ${groupableNodesAbove[0].data.label}`;
              }
            }
            contextMenuItems = [
              ...contextMenuItems,
              {
                name: label,
                action: () => onGroupRows(map(groupableNodesAbove, (n: Table.RowNode) => n.data as Table.DataRow<R, M>))
              }
            ];
          }
        }
      }
      return contextMenuItems;
    });

  const getDataRowContextMenuItems: (row: Table.DataRow<R, M>, node: Table.RowNode) => Table.MenuItemDef[] =
    hooks.useDynamicCallback((row: Table.DataRow<R, M>, node: Table.RowNode): Table.MenuItemDef[] => {
      let contextMenuItems: Table.MenuItemDef[] = !isNil(params.getDataRowContextMenuItems)
        ? params.getDataRowContextMenuItems(row, node)
        : [];
      if (params.rowCanDelete?.(row) === true) {
        contextMenuItems = [
          ...contextMenuItems,
          {
            name: `Delete ${getRowLabel(row)}`,
            action: () => params.onChangeEvent({ payload: { rows: row }, type: "rowDelete" })
          }
        ];
      }
      return [...contextMenuItems, ...getDataRowGroupContextMenuItems(row, node)];
    });

  const getGroupRowContextMenuItems: (row: Table.GroupRow<R>, node: Table.RowNode) => Table.MenuItemDef[] =
    hooks.useDynamicCallback((row: Table.GroupRow<R>, node: Table.RowNode): Table.MenuItemDef[] => {
      return [
        ...(!isNil(params.getGroupRowContextMenuItems) ? params.getGroupRowContextMenuItems(row, node) : []),
        {
          name: `Ungroup ${row.name}`,
          action: () =>
            params.onChangeEvent({
              type: "rowDelete",
              payload: { rows: row }
            })
        }
      ];
    });

  const getContextMenuItems: (row: Table.Row<R, M>, node: Table.RowNode) => Table.MenuItemDef[] =
    hooks.useDynamicCallback((row: Table.Row<R, M>, node: Table.RowNode): Table.MenuItemDef[] => {
      if (tabling.typeguards.isDataRow(row)) {
        return getDataRowContextMenuItems(row, node);
      }
      return getGroupRowContextMenuItems(row, node);
    });

  return [getContextMenuItems];
};

export default useContextMenu;
