/* eslint-disable quotes */
import { useMemo } from "react";
import { map, isNil, includes, find, filter } from "lodash";

import { tabling, hooks, util } from "lib";

export type UseContextMenuParams<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
  readonly apis: Table.GridApis | null;
  readonly data: Table.BodyRow<R>[];
  /* eslint-disable @typescript-eslint/no-explicit-any */
  readonly editColumnConfig?: Table.EditColumnRowConfig<R, any>[];
  readonly getModelRowLabel?: Table.RowStringGetter<Table.DataRow<R>>;
  readonly getModelRowName?: Table.RowStringGetter<Table.DataRow<R>>;
  readonly getGroupRowLabel?: Table.RowStringGetter<Table.GroupRow<R>>;
  readonly getGroupRowName?: Table.RowStringGetter<Table.GroupRow<R>>;
  readonly getMarkupRowLabel?: Table.RowStringGetter<Table.MarkupRow<R>>;
  readonly getMarkupRowName?: Table.RowStringGetter<Table.MarkupRow<R>>;
  readonly onEvent: (event: Table.Event<R, M>) => void;
  readonly getGroupRowContextMenuItems?: (row: Table.GroupRow<R>, node: Table.RowNode) => Table.MenuItemDef[];
  readonly getModelRowContextMenuItems?: (row: Table.ModelRow<R>, node: Table.RowNode) => Table.MenuItemDef[];
  readonly getMarkupRowContextMenuItems?: (row: Table.MarkupRow<R>, node: Table.RowNode) => Table.MenuItemDef[];
  readonly rowCanDelete?: (row: Table.ModelRow<R> | Table.MarkupRow<R>) => boolean;
  readonly onGroupRows?: (rows: Table.ModelRow<R>[]) => void;
  readonly onMarkupRows?: (rows?: Table.ModelRow<R>[]) => void;
};

const evaluateRowStringGetter = <R extends Table.RowData, RW extends Table.BodyRow<R>>(
  value: Table.RowStringGetter<RW> | undefined,
  row: RW
): Table.RowNameLabelType | undefined => (typeof value === "function" ? value(row) : value);

type IsRowType<R extends Table.RowData, RW extends Table.BodyRow<R> = Table.BodyRow<R>> = (
  row: Table.Row<R>
) => row is RW;

type RowStringGetterCase<R extends Table.RowData, RW extends Table.BodyRow<R> = Table.BodyRow<R>> = {
  readonly getter: Table.RowStringGetter<RW> | undefined;
  readonly flt: IsRowType<R, RW>;
};

const evaluateCases = <R extends Table.RowData, RW extends Table.BodyRow<R>>(
  cases: Array<
    | RowStringGetterCase<R, Table.DataRow<R>>
    | RowStringGetterCase<R, Table.GroupRow<R>>
    | RowStringGetterCase<R, Table.MarkupRow<R>>
  >,
  row: RW,
  def: Table.RowNameLabelType
): string => {
  for (let i = 0; i < cases.length; i++) {
    const getter = cases[i].getter as Table.RowStringGetter<RW> | undefined;
    if (!isNil(getter) && cases[i].flt(row) === true) {
      const evaluated: Table.RowNameLabelType | undefined = evaluateRowStringGetter(getter, row);
      return !isNil(evaluated) ? String(evaluated) : String(def);
    }
  }
  return String(def);
};

const useContextMenu = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  params: UseContextMenuParams<R, M>
): [(row: Table.BodyRow<R>, node: Table.RowNode) => Table.MenuItemDef[]] => {
  const getRowName = useMemo(
    () =>
      (row: Table.BodyRow<R>, def: Table.RowNameLabelType): string => {
        const cases: [
          RowStringGetterCase<R, Table.DataRow<R>>,
          RowStringGetterCase<R, Table.MarkupRow<R>>,
          RowStringGetterCase<R, Table.GroupRow<R>>
        ] = [
          { getter: params.getModelRowName, flt: tabling.typeguards.isDataRow },
          { getter: params.getMarkupRowName, flt: tabling.typeguards.isMarkupRow },
          { getter: params.getGroupRowName, flt: tabling.typeguards.isGroupRow }
        ];
        return evaluateCases(cases, row, def);
      },
    [params.getModelRowLabel, params.getMarkupRowLabel, params.getGroupRowLabel]
  );

  const getRowLabel = useMemo(
    () =>
      (row: Table.BodyRow<R>, def: Table.RowNameLabelType = "Row"): string => {
        const cases: [
          RowStringGetterCase<R, Table.DataRow<R>>,
          RowStringGetterCase<R, Table.MarkupRow<R>>,
          RowStringGetterCase<R, Table.GroupRow<R>>
        ] = [
          { getter: params.getModelRowLabel, flt: tabling.typeguards.isDataRow },
          { getter: params.getMarkupRowLabel, flt: tabling.typeguards.isMarkupRow },
          { getter: params.getGroupRowLabel, flt: tabling.typeguards.isGroupRow }
        ];
        return evaluateCases(cases, row, def);
      },
    [params.getModelRowLabel, params.getMarkupRowLabel, params.getGroupRowLabel]
  );

  const findGroupableRowsAbove = useMemo(
    () =>
      (node: Table.RowNode): Table.ModelRow<R>[] => {
        const firstRow: Table.BodyRow<R> = node.data;
        if (tabling.typeguards.isModelRow(firstRow)) {
          const rows: Table.ModelRow<R>[] = [firstRow];
          if (!isNil(params.apis)) {
            let currentNode: Table.RowNode | undefined = node;
            while (!isNil(currentNode) && !isNil(currentNode.rowIndex) && currentNode.rowIndex >= 1) {
              currentNode = params.apis.grid.getDisplayedRowAtIndex(currentNode.rowIndex - 1);
              if (!isNil(currentNode)) {
                const row: Table.BodyRow<R> = currentNode.data;
                if (tabling.typeguards.isGroupRow(row)) {
                  break;
                } else if (tabling.typeguards.isModelRow(row)) {
                  rows.push(row);
                }
              }
            }
          }
          return rows;
        }
        return [];
      },
    [params.apis?.grid]
  );

  const findMarkupableRowsAbove = useMemo(
    () =>
      (node: Table.RowNode): Table.ModelRow<R>[] => {
        const firstRow: Table.BodyRow<R> = node.data;
        if (tabling.typeguards.isModelRow(firstRow)) {
          const rows: Table.ModelRow<R>[] = [firstRow];
          if (!isNil(params.apis)) {
            let currentNode: Table.RowNode | undefined = node;
            while (!isNil(currentNode) && !isNil(currentNode.rowIndex) && currentNode.rowIndex >= 1) {
              currentNode = params.apis.grid.getDisplayedRowAtIndex(currentNode.rowIndex - 1);
              if (!isNil(currentNode)) {
                const row: Table.BodyRow<R> = currentNode.data;
                if (tabling.typeguards.isModelRow(row)) {
                  rows.push(row);
                }
              }
            }
          }
          return rows;
        }
        return [];
      },
    [params.apis?.grid]
  );

  const getModelRowGroupContextMenuItems = useMemo(
    () =>
      (row: Table.ModelRow<R>, node: Table.RowNode): Table.MenuItemDef[] => {
        let contextMenuItems: Table.MenuItemDef[] = [];

        const onGroupRows = params.onGroupRows;
        if (!isNil(onGroupRows)) {
          const groupRows: Table.GroupRow<R>[] = filter(params.data, (r: Table.BodyRow<R>) =>
            tabling.typeguards.isGroupRow(r)
          ) as Table.GroupRow<R>[];

          // The GroupRow that the ModelRow already potentially belongs to.
          const groupRow: Table.GroupRow<R> | undefined = find(groupRows, (r: Table.GroupRow<R>) =>
            includes(r.children, row.id)
          );
          if (!isNil(groupRow)) {
            contextMenuItems = [
              ...contextMenuItems,
              {
                name: `Remove ${getRowLabel(row)} from ${getRowName(groupRow, groupRow.groupData.name)} Subtotal`,
                icon: '<i class="far fa-folder-minus context-icon"></i>',
                action: () =>
                  params.onEvent({
                    type: "rowRemoveFromGroup",
                    payload: { rows: [row.id], group: groupRow.id }
                  })
              }
            ];
          } else {
            const groupableRowsAbove = findGroupableRowsAbove(node);
            if (groupableRowsAbove.length !== 0) {
              let label: string;
              if (groupableRowsAbove.length === 1) {
                label = `Create a Subtotal`;
              } else {
                label = `Subtotal ${getRowLabel(row)}s Above`;
                const lastRow: Table.ModelRow<R> | Table.MarkupRow<R> | undefined =
                  groupableRowsAbove[groupableRowsAbove.length - 1];
                if (!isNil(lastRow)) {
                  const endpoints = [getRowName(row, ""), getRowName(lastRow, "")];
                  if (!(endpoints[0] === "" && endpoints[1] === "")) {
                    label = `Subtotal ${getRowLabel(row)}s ${util.conditionalJoinString(
                      endpoints[1] || null,
                      endpoints[0] || null,
                      {
                        delimeter: " to ",
                        replaceMissing: "-"
                      }
                    )}`;
                  }
                }
              }
              contextMenuItems = [
                ...contextMenuItems,
                {
                  name: label,
                  icon: '<i class="far fa-folder context-icon"></i>',
                  action: () => onGroupRows(groupableRowsAbove)
                }
              ];
            }
            if (groupRows.length !== 0) {
              contextMenuItems = [
                ...contextMenuItems,
                {
                  name: "Add to Subtotal",
                  icon: '<i class="far fa-folder-plus context-icon"></i>',
                  subMenu: map(groupRows, (gr: Table.GroupRow<R>) => ({
                    name: `${getRowName(gr, gr.groupData.name)}`,
                    icon: '<i class="far fa-folders context-icon"></i>',
                    action: () =>
                      params.onEvent({
                        type: "rowAddToGroup",
                        payload: { rows: [row.id], group: gr.id }
                      })
                  }))
                }
              ];
            }
          }
        }
        return contextMenuItems;
      },
    [params.onGroupRows, params.onEvent, findGroupableRowsAbove, getRowLabel, getRowName, params.data]
  );

  const getModelRowMarkupContextMenuItems: (row: Table.ModelRow<R>, node: Table.RowNode) => Table.MenuItemDef[] =
    hooks.useDynamicCallback((row: Table.ModelRow<R>, node: Table.RowNode): Table.MenuItemDef[] => {
      let contextMenuItems: Table.MenuItemDef[] = [];
      const onMarkupRows = params.onMarkupRows;
      if (!isNil(onMarkupRows)) {
        const markupableRowsAbove: Table.ModelRow<R>[] = findMarkupableRowsAbove(node);
        if (markupableRowsAbove.length !== 0) {
          contextMenuItems = [
            ...contextMenuItems,
            {
              name: "Insert Markup",
              icon: '<i class="far fa-badge-percent context-icon"></i>',
              action: () => onMarkupRows(markupableRowsAbove)
            }
          ];
        }
      }
      return contextMenuItems;
    });

  const getMarkupRowContextMenuItems: (row: Table.MarkupRow<R>, node: Table.RowNode) => Table.MenuItemDef[] =
    hooks.useDynamicCallback((row: Table.MarkupRow<R>, node: Table.RowNode): Table.MenuItemDef[] => {
      let contextMenuItems: Table.MenuItemDef[] = !isNil(params.getMarkupRowContextMenuItems)
        ? params.getMarkupRowContextMenuItems(row, node)
        : [];
      const editMarkupConfig = !isNil(params.editColumnConfig)
        ? tabling.columns.getEditColumnRowConfig(params.editColumnConfig, row, "edit")
        : null;
      if (!isNil(editMarkupConfig)) {
        contextMenuItems = [
          ...contextMenuItems,
          {
            name: `Edit ${getRowLabel(row)}`,
            icon: '<i class="far fa-pencil context-icon"></i>',
            action: () => editMarkupConfig.action(row, false)
          }
        ];
      }
      if (isNil(params.rowCanDelete) || params.rowCanDelete(row) === true) {
        contextMenuItems = [
          ...contextMenuItems,
          {
            name: `Delete ${getRowLabel(row)}`,
            icon: '<i class="far fa-trash-alt context-icon"></i>',
            action: () => params.onEvent({ payload: { rows: row.id }, type: "rowDelete" })
          }
        ];
      }
      return ["copy", ...contextMenuItems];
    });

  const getModelRowContextMenuItems: (row: Table.ModelRow<R>, node: Table.RowNode) => Table.MenuItemDef[] =
    hooks.useDynamicCallback((row: Table.ModelRow<R>, node: Table.RowNode): Table.MenuItemDef[] => {
      let contextMenuItems: Table.MenuItemDef[] = !isNil(params.getModelRowContextMenuItems)
        ? params.getModelRowContextMenuItems(row, node)
        : [];

      if (!isNil(params.apis) && !isNil(node.rowIndex)) {
        const groupRow = tabling.aggrid.getNodeGroupRow(params.apis.grid, node);
        const previous: Table.ModelRow<R> | null = tabling.aggrid.getNodePreviousModelRow(params.apis.grid, node);
        if (!isNil(previous)) {
          contextMenuItems = [
            ...contextMenuItems,
            {
              name: `Insert ${getRowLabel(row)} Above`,
              icon: '<i class="far fa-hand-point-up context-icon"></i>',
              action: () =>
                params.onEvent({
                  payload: {
                    previous: previous.id,
                    data: {},
                    group: !isNil(groupRow) ? groupRow.id : null
                  },
                  type: "rowInsert"
                })
            }
          ];
        }
        contextMenuItems = [
          ...contextMenuItems,
          {
            name: `Insert ${getRowLabel(row)} Below`,
            icon: '<i class="far fa-hand-point-down context-icon"></i>',
            action: () =>
              params.onEvent({
                payload: {
                  previous: row.id,
                  data: {},
                  group: !isNil(groupRow) ? groupRow.id : null
                },
                type: "rowInsert"
              })
          }
        ];
      }

      if (isNil(params.rowCanDelete) || params.rowCanDelete(row) === true) {
        contextMenuItems = [
          ...contextMenuItems,
          {
            name: `Delete ${getRowLabel(row)}`,
            icon: '<i class="far fa-trash-alt context-icon"></i>',
            action: () => params.onEvent({ payload: { rows: row.id }, type: "rowDelete" })
          }
        ];
      }
      return [
        "copy",
        ...contextMenuItems,
        ...getModelRowGroupContextMenuItems(row, node),
        ...getModelRowMarkupContextMenuItems(row, node)
      ];
    });

  const getGroupRowContextMenuItems: (row: Table.GroupRow<R>, node: Table.RowNode) => Table.MenuItemDef[] =
    hooks.useDynamicCallback((row: Table.GroupRow<R>, node: Table.RowNode): Table.MenuItemDef[] => {
      let contextMenuItems = [
        ...(!isNil(params.getGroupRowContextMenuItems) ? params.getGroupRowContextMenuItems(row, node) : []),
        {
          name: `Ungroup ${getRowName(row, row.groupData.name)}`,
          icon: '<i class="far fa-folder-minus context-icon"></i>',
          action: () =>
            params.onEvent({
              type: "rowDelete",
              payload: { rows: row.id }
            })
        }
      ];
      const editGroupConfig = !isNil(params.editColumnConfig)
        ? tabling.columns.getEditColumnRowConfig(params.editColumnConfig, row, "edit")
        : null;
      if (!isNil(editGroupConfig)) {
        contextMenuItems = [
          {
            name: `Edit ${getRowName(row, row.groupData.name)}`,
            icon: '<i class="far fa-pencil context-icon"></i>',
            action: () => editGroupConfig.action(row, false)
          },
          ...contextMenuItems
        ];
      }
      return contextMenuItems;
    });

  const getContextMenuItems: (row: Table.BodyRow<R>, node: Table.RowNode) => Table.MenuItemDef[] =
    hooks.useDynamicCallback((row: Table.BodyRow<R>, node: Table.RowNode): Table.MenuItemDef[] => {
      if (tabling.typeguards.isModelRow(row)) {
        return getModelRowContextMenuItems(row, node);
      } else if (tabling.typeguards.isGroupRow(row)) {
        return getGroupRowContextMenuItems(row, node);
      } else if (tabling.typeguards.isMarkupRow(row)) {
        return getMarkupRowContextMenuItems(row, node);
      }
      return [];
    });

  return [getContextMenuItems];
};

export default useContextMenu;
