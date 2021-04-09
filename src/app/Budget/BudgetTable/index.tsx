import React, { useState, useEffect, useMemo } from "react";
import classNames from "classnames";
import { map, isNil, includes, find, concat, uniq, forEach, filter, groupBy, orderBy } from "lodash";

import { AgGridReact } from "ag-grid-react";
import { ChangeDetectionStrategyType } from "ag-grid-react/lib/changeDetectionService";
import {
  ColDef,
  CellEditingStoppedEvent,
  CellClassParams,
  GridApi,
  GridReadyEvent,
  RowNode,
  EditableCallbackParams,
  ColumnApi,
  Column,
  CellKeyDownEvent,
  CellPosition,
  NavigateToNextCellParams,
  ColSpanParams,
  RowClassParams,
  GridOptions,
  GetContextMenuItemsParams,
  MenuItemDef,
  CellValueChangedEvent,
  PasteEndEvent,
  PasteStartEvent,
  FirstDataRenderedEvent,
  SuppressKeyboardEventParams
} from "ag-grid-community";

import { TABLE_DEBUG } from "config";
import { RenderWithSpinner, ShowHide } from "components/display";
import { useDynamicCallback, useDeepEqualMemo } from "lib/hooks";
import { hashString, updateFieldOrdering, orderByFieldOrdering } from "lib/util";
import { downloadAsCsvFile } from "lib/util/files";
import { mergeClassNames, mergeClassNamesFn } from "lib/tabling/util";
import { currencyValueFormatter } from "lib/tabling/formatters";
import { processCell } from "lib/tabling/processor";

import {
  ExpandCell,
  IndexCell,
  ValueCell,
  SubAccountUnitCell,
  IdentifierCell,
  CalculatedCell,
  PaymentMethodsCell,
  BudgetItemCell,
  FringeUnitCell,
  FringesCell,
  HeaderCell
} from "./cells";
import { BudgetTableProps } from "./model";
import TableHeader from "./TableHeader";
import { IncludeErrorsInCell, HideCellForAllFooters, ShowCellOnlyForRowType } from "./Util";
import "./index.scss";

export * from "./model";

const BudgetTable = <
  R extends Table.Row<G, C>,
  M extends Model,
  G extends IGroup<any>,
  P extends Http.IPayload = Http.IPayload,
  C extends Model = UnknownModel
>({
  /* eslint-disable indent */
  bodyColumns,
  calculatedColumns = [],
  data,
  placeholders = [],
  groups = [],
  selected,
  mapping,
  search,
  loading,
  loadingBudget,
  saving,
  frameworkComponents = {},
  exportFileName,
  getExportValue,
  nonEditableCells,
  groupParams,
  identifierField,
  identifierFieldHeader,
  identifierColumn = {},
  actionColumn = {},
  expandColumn = {},
  indexColumn = {},
  tableFooterIdentifierValue = "Grand Total",
  budgetFooterIdentifierValue = "Budget Total",
  tableTotals,
  budgetTotals,
  sizeColumnsToFit = true,
  processors,
  renderFlag = true,
  cellClass,
  onSearch,
  onSelectAll,
  onRowUpdate,
  onRowBulkUpdate,
  onRowSelect,
  onRowDeselect,
  onRowAdd,
  onRowDelete,
  onRowExpand,
  onBack,
  isCellEditable,
  isCellSelectable,
  rowRefreshRequired,
  ...options
}: BudgetTableProps<R, M, G, P, C>) => {
  const [allSelected, setAllSelected] = useState(false);
  const [focused, setFocused] = useState(false);
  const [table, setTable] = useState<R[]>([]);
  const [ordering, setOrdering] = useState<FieldOrder<keyof R>[]>([]);
  const [cellChangeEvents, setCellChangeEvents] = useState<CellValueChangedEvent[]>([]);
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);
  const [columnApi, setColumnApi] = useState<ColumnApi | undefined>(undefined);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [budgetFooterColDefs, setBudgetFooterColDefs] = useState<ColDef[]>([]);
  const [tableFooterColumnApi, setTableFooterColumnApi] = useState<ColumnApi | undefined>(undefined);
  const [budgetFooterColumnApi, setBudgetFooterColumnApi] = useState<ColumnApi | undefined>(undefined);
  const [gridOptions, setGridOptions] = useState<GridOptions>({
    alignedGrids: [],
    defaultColDef: {
      resizable: true,
      sortable: false,
      filter: false
    },
    suppressHorizontalScroll: true,
    suppressContextMenu: TABLE_DEBUG,
    suppressCopyRowsToClipboard: isNil(onRowBulkUpdate),
    suppressClipboardPaste: isNil(onRowBulkUpdate),
    ...options
  });
  const [tableFooterGridOptions, setTableFooterGridOptions] = useState<GridOptions>({
    alignedGrids: [],
    defaultColDef: {
      resizable: false,
      sortable: false,
      filter: false,
      editable: false,
      cellClass: "cell--not-editable"
    },
    suppressContextMenu: true,
    suppressHorizontalScroll: true
  });
  const [budgetFooterGridOptions, setBudgetFooterGridOptions] = useState<GridOptions>({
    alignedGrids: [],
    defaultColDef: {
      resizable: false,
      sortable: false,
      filter: false,
      editable: false,
      cellClass: "cell--not-editable"
    },
    suppressContextMenu: true,
    suppressHorizontalScroll: true
  });

  const onFirstDataRendered = useDynamicCallback((event: FirstDataRenderedEvent): void => {
    const api = event.api;
    if (sizeColumnsToFit === true) {
      event.api.sizeColumnsToFit();
    }
    api.ensureIndexVisible(0);

    const cols = event.columnApi.getAllColumns();
    if (!isNil(cols)) {
      const identifierCol: Column | undefined = find(cols, obj => obj.getColId() === "identifier");
      if (!isNil(identifierCol)) {
        api.setFocusedCell(0, identifierCol);
        const selectedRow = api.getDisplayedRowAtIndex(0);
        selectedRow?.setSelected(true);
      }
    }
  });

  const onGridReady = useDynamicCallback((event: GridReadyEvent): void => {
    setGridApi(event.api);
    setColumnApi(event.columnApi);
  });

  const onTableFooterFirstDataRendered = useDynamicCallback((event: FirstDataRenderedEvent): void => {
    if (sizeColumnsToFit === true) {
      event.api.sizeColumnsToFit();
    }
  });

  const onTableFooterGridReady = useDynamicCallback((event: GridReadyEvent): void => {
    setTableFooterColumnApi(event.columnApi);
  });

  const onBudgetFooterFirstDataRendered = useDynamicCallback((event: FirstDataRenderedEvent): void => {
    event.api.sizeColumnsToFit();
  });

  const onBudgetFooterGridReady = useDynamicCallback((event: GridReadyEvent): void => {
    setBudgetFooterColumnApi(event.columnApi);
  });

  useEffect(() => {
    const keyListener = (e: KeyboardEvent) => {
      const ctrlCmdPressed = e.ctrlKey || e.metaKey;
      if (gridApi) {
        if (e.key === "ArrowDown" && ctrlCmdPressed) {
          const focusedCell = gridApi.getFocusedCell();
          if (focusedCell) {
            const row = gridApi?.getDisplayedRowAtIndex(focusedCell?.rowIndex);
            if (onRowExpand && !isNil(row?.data.identifier)) {
              onRowExpand(row?.data.id);
            }
          }
        }
        if (e.key === "ArrowUp" && ctrlCmdPressed) {
          if (onBack) {
            onBack();
          }
        }
      }
    };
    window.addEventListener("keydown", keyListener);
    return () => window.removeEventListener("keydown", keyListener);
  }, [gridApi]);

  useEffect(() => {
    setGridOptions({
      ...gridOptions,
      alignedGrids: [tableFooterGridOptions, budgetFooterGridOptions]
    });
    setBudgetFooterGridOptions({ ...budgetFooterGridOptions, alignedGrids: [gridOptions, tableFooterGridOptions] });
    setTableFooterGridOptions({ ...tableFooterGridOptions, alignedGrids: [gridOptions, budgetFooterGridOptions] });
  }, []);

  const _isCellSelectable = useDynamicCallback<boolean>((row: R, colDef: ColDef): boolean => {
    if (includes(["delete", "index", "expand"], colDef.field)) {
      return false;
    } else if (row.meta.isTableFooter === true || row.meta.isGroupFooter === true || row.meta.isBudgetFooter) {
      return false;
    } else if (!isNil(isCellSelectable)) {
      return isCellSelectable(row, colDef);
    }
    return true;
  });

  const _isCellEditable = useDynamicCallback<boolean>((row: R, colDef: ColDef): boolean => {
    if (includes(["delete", "index", "expand"], colDef.field)) {
      return false;
    } else if (row.meta.isTableFooter === true || row.meta.isGroupFooter === true || row.meta.isBudgetFooter) {
      return false;
    } else if (!isNil(nonEditableCells) && includes(nonEditableCells, colDef.field as keyof R)) {
      return false;
    } else if (
      includes(
        map(calculatedColumns, (col: ColDef) => col.field),
        colDef.field
      )
    ) {
      return false;
    } else if (!isNil(isCellEditable)) {
      return isCellEditable(row, colDef);
    }
    return true;
  });

  const actionCell = useDynamicCallback<ColDef>(
    (col: ColDef): ColDef => {
      return {
        width: 20,
        maxWidth: 25,
        ...col,
        cellClass: mergeClassNamesFn("cell--action", "cell--not-editable", "cell--not-selectable", col.cellClass),
        editable: false,
        headerName: "",
        resizable: false
      };
    }
  );

  const indexCell = useDynamicCallback<ColDef>(
    (col: ColDef): ColDef =>
      actionCell({
        ...actionColumn,
        ...indexColumn,
        field: "index",
        cellRenderer: "IndexCell",
        cellRendererParams: {
          onSelect: onRowSelect,
          onDeselect: onRowDeselect,
          onNew: onRowAdd,
          ...col.cellRendererParams,
          ...actionColumn.cellRendererParams,
          ...indexColumn.cellRendererParams
        },
        cellClass: classNames(indexColumn.cellClass, actionColumn.cellClass),
        colSpan: (params: ColSpanParams) => {
          const row: R = params.data;
          if (row.meta.isGroupFooter === true || row.meta.isTableFooter === true || row.meta.isBudgetFooter === true) {
            if (!isNil(onRowExpand)) {
              return 2;
            }
            return 1;
          }
          return 1;
        }
      })
  );

  const identifierCell = useDynamicCallback<ColDef>(
    (col: ColDef): ColDef => ({
      field: identifierField,
      headerName: identifierFieldHeader,
      cellRenderer: "IdentifierCell",
      width: 100,
      ...identifierColumn,
      colSpan: (params: ColSpanParams) => {
        const row: R = params.data;
        if (row.meta.isGroupFooter === true || row.meta.isTableFooter === true || row.meta.isBudgetFooter) {
          return bodyColumns.length + 1;
        } else if (!isNil(identifierColumn.colSpan)) {
          return identifierColumn.colSpan(params);
        }
        return 1;
      },
      cellRendererParams: {
        ...identifierColumn.cellRendererParams,
        onGroupEdit: !isNil(groupParams) ? groupParams.onEditGroup : undefined
      }
    })
  );

  const expandCell = useDynamicCallback<ColDef>(
    (col: ColDef): ColDef =>
      actionCell({
        ...col,
        field: "expand",
        cellRenderer: "ExpandCell",
        cellRendererParams: { onClick: onRowExpand },
        cellClass: mergeClassNamesFn(col.cellClass, expandColumn.cellClass, actionColumn.cellClass)
      })
  );

  const calculatedCell = useDynamicCallback<ColDef>(
    (col: ColDef): ColDef => {
      return {
        width: 100,
        maxWidth: 100,
        ...col,
        cellRenderer: "CalculatedCell",
        cellStyle: { textAlign: "right" },
        valueFormatter: currencyValueFormatter,
        cellRendererParams: {
          ...col.cellRendererParams,
          renderRedIfNegative: true
        },
        cellClass: (params: CellClassParams) => {
          const row: R = params.node.data;
          if (
            row.meta.isBudgetFooter === false &&
            row.meta.isGroupFooter === false &&
            row.meta.isTableFooter === false
          ) {
            return mergeClassNames(params, "cell--not-editable-highlight", col.cellClass);
          }
          return mergeClassNames(params, col.cellClass);
        }
      };
    }
  );

  const bodyCell = useDynamicCallback<ColDef>(
    (col: ColDef): ColDef => {
      return {
        cellRenderer: "ValueCell",
        headerComponentParams: {
          onSort: (order: Order, field: keyof R) => {
            setOrdering(updateFieldOrdering(ordering, field, order));
          }
        },
        ...col
      };
    }
  );

  const universalCell = useDynamicCallback<ColDef>(
    (col: ColDef): ColDef => {
      return {
        ...col,
        suppressMenu: true,
        editable: (params: EditableCallbackParams) => _isCellEditable(params.node.data as R, params.colDef),
        cellClass: (params: CellClassParams) => {
          const row: R = params.node.data;
          return mergeClassNames(params, cellClass, col.cellClass, {
            "cell--not-selectable": !_isCellSelectable(row, params.colDef),
            "cell--not-editable": !_isCellEditable(row, params.colDef)
          });
        }
      };
    }
  );

  const suppressNavigation = (params: SuppressKeyboardEventParams) => {
    const e = params.event;
    const ctrlCmdPressed = e.ctrlKey || e.metaKey;
    if (params.api) {
      if ((e.key === "ArrowDown" || e.key === "ArrowUp") && ctrlCmdPressed) {
        return true;
      }
    }
    return false;
  };

  const baseColumns = useMemo((): ColDef[] => {
    let baseLeftColumns: ColDef[] = [indexCell({})];
    if (!isNil(onRowExpand)) {
      // This cell will be hidden for the table footer since the previous index
      // cell will span over this column.
      baseLeftColumns.push(expandCell({}));
    }
    baseLeftColumns.push(identifierCell({}));
    return baseLeftColumns;
  }, [onRowExpand]);

  const createGroupFooter = (group: G): R => {
    const footerObj: { [key: string]: any } = {
      id: hashString(group.name),
      [identifierField]: group.name,
      group,
      meta: {
        isPlaceholder: true,
        isGroupFooter: true,
        selected: false,
        children: [],
        errors: []
      }
    };
    forEach(bodyColumns, (col: ColDef) => {
      if (!isNil(col.field)) {
        footerObj[col.field] = null;
      }
    });
    forEach(calculatedColumns, (col: ColDef) => {
      if (!isNil(col.field) && !isNil(group[col.field as keyof G])) {
        footerObj[col.field] = group[col.field as keyof G];
      }
    });
    return footerObj as R;
  };

  const tableFooter = useMemo((): R | null => {
    const footerObj: { [key: string]: any } = {
      id: hashString("tablefooter"),
      [identifierField]: tableFooterIdentifierValue,
      meta: {
        isPlaceholder: false,
        isGroupFooter: false,
        isTableFooter: true,
        isBudgetFooter: false,
        selected: false,
        children: [],
        errors: []
      }
    };
    forEach(bodyColumns, (col: ColDef) => {
      if (!isNil(col.field)) {
        footerObj[col.field] = null;
      }
    });
    forEach(calculatedColumns, (col: ColDef) => {
      if (!isNil(col.field)) {
        if (!isNil(tableTotals) && !isNil(tableTotals[col.field])) {
          footerObj[col.field] = tableTotals[col.field];
        } else {
          footerObj[col.field] = null;
        }
      }
    });
    return footerObj as R;
  }, [useDeepEqualMemo(tableTotals), tableFooterIdentifierValue]);

  const budgetFooter = useMemo((): R | null => {
    if (!isNil(budgetTotals)) {
      let fieldsLoading: string[] = [];
      if (loadingBudget === true) {
        fieldsLoading = map(calculatedColumns, (col: ColDef) => col.field) as string[];
      }
      const footerObj: { [key: string]: any } = {
        id: hashString("budgetfooter"),
        [identifierField]: budgetFooterIdentifierValue,
        meta: {
          isPlaceholder: false,
          isGroupFooter: false,
          isTableFooter: false,
          isBudgetFooter: true,
          selected: false,
          children: [],
          errors: [],
          fieldsLoading
        }
      };
      forEach(bodyColumns, (col: ColDef) => {
        if (!isNil(col.field)) {
          footerObj[col.field] = null;
        }
      });
      forEach(calculatedColumns, (col: ColDef) => {
        if (!isNil(col.field) && !isNil(budgetTotals[col.field])) {
          footerObj[col.field] = budgetTotals[col.field];
        }
      });
      return footerObj as R;
    }
    return null;
  }, [useDeepEqualMemo(budgetTotals), budgetFooterIdentifierValue, loadingBudget]);

  /**
   * Starting at the provided index, either traverses the table upwards or downwards
   * until a RowNode that is not used as a group footer is found.
   */
  const findFirstNonGroupFooterRow = useDynamicCallback((startingIndex: number, direction: "asc" | "desc" = "asc"): [
    RowNode | null,
    number,
    number
  ] => {
    if (!isNil(gridApi)) {
      let runningIndex = 0;
      let noMoreRows = false;
      let nextRowNode: RowNode | null = null;

      while (noMoreRows === false) {
        if (direction === "desc" && startingIndex - runningIndex < 0) {
          noMoreRows = true;
          break;
        }
        nextRowNode = gridApi.getDisplayedRowAtIndex(
          direction === "asc" ? startingIndex + runningIndex : startingIndex - runningIndex
        );
        if (isNil(nextRowNode)) {
          noMoreRows = true;
        } else {
          const row: R = nextRowNode.data;
          if (row.meta.isGroupFooter === false) {
            return [nextRowNode, startingIndex + runningIndex, runningIndex];
          }
          runningIndex = runningIndex + 1;
        }
      }
      return [nextRowNode, startingIndex + runningIndex, runningIndex];
    } else {
      return [null, startingIndex, 0];
    }
  });

  /**
   * Starting at the provided node, traverses the table upwards and collects
   * all of the RowNode(s) until a RowNode that is the footer for a group above
   * the provided node is reached.
   */
  const findRowsUpUntilFirstGroupFooterRow = useDynamicCallback((node: RowNode): RowNode[] => {
    const nodes: RowNode[] = [node];
    if (!isNil(gridApi)) {
      let currentNode: RowNode | null = node;
      while (!isNil(currentNode) && !isNil(currentNode.rowIndex) && currentNode.rowIndex >= 1) {
        currentNode = gridApi.getDisplayedRowAtIndex(currentNode.rowIndex - 1);
        if (!isNil(currentNode)) {
          const row: R = currentNode.data;
          if (row.meta.isGroupFooter === true) {
            break;
          } else {
            // NOTE: In practice, we will never reach a non-group footer node that belongs to a group
            // before we reach the group footer node, so as long as the ordering/grouping of rows
            // is consistent.  However, we will also make sure that the row does not belong to a group
            // for safety.
            if (isNil(row.group) && !(row.meta.isPlaceholder === true)) {
              nodes.push(currentNode);
            }
          }
        }
      }
    }
    return nodes;
  });

  const navigateToNextCell = useDynamicCallback(
    (params: NavigateToNextCellParams): CellPosition => {
      if (!isNil(params.nextCellPosition)) {
        const verticalAscend = params.previousCellPosition.rowIndex < params.nextCellPosition.rowIndex;
        const verticalDescend = params.previousCellPosition.rowIndex > params.nextCellPosition.rowIndex;

        if (verticalAscend === true) {
          const [rowNode, _, additionalIndex] = findFirstNonGroupFooterRow(params.nextCellPosition.rowIndex);
          if (!isNil(rowNode)) {
            return {
              ...params.nextCellPosition,
              rowIndex: params.nextCellPosition.rowIndex + additionalIndex
            };
          }
          return params.nextCellPosition;
        } else if (verticalDescend === true) {
          const [rowNode, _, additionalIndex] = findFirstNonGroupFooterRow(params.nextCellPosition.rowIndex, "desc");
          if (!isNil(rowNode)) {
            return {
              ...params.nextCellPosition,
              rowIndex: params.nextCellPosition.rowIndex - additionalIndex
            };
          }
          return params.nextCellPosition;
        } else if (includes(["expand", "select"], params.nextCellPosition.column.getColId())) {
          return params.previousCellPosition;
        } else {
          return params.nextCellPosition;
        }
      }
      return params.previousCellPosition;
    }
  );

  const onCellKeyDown = useDynamicCallback((event: CellKeyDownEvent) => {
    if (!isNil(event.rowIndex) && !isNil(event.event)) {
      // I do not understand why AGGrid's Event has an underlying Event that is in
      // reality a KeyboardEvent but does not have any of the properties that a KeyboardEvent
      // should have - meaning we have to tell TS to ignore this line.
      /* @ts-ignore */
      if (event.event.keyCode === 13) {
        event.api.stopEditing(false);
        event.api.clearFocusedCell();

        const firstEditCol = event.columnApi.getColumn(event.column.getColId());
        if (!isNil(firstEditCol)) {
          event.api.ensureColumnVisible(firstEditCol);

          let foundNonFooterRow = false;
          let nextRowNode: RowNode | null;
          let additionalIndex = 1;
          while (foundNonFooterRow === false) {
            nextRowNode = event.api.getDisplayedRowAtIndex(event.rowIndex + additionalIndex);
            if (isNil(nextRowNode)) {
              onRowAdd();
              event.api.setFocusedCell(event.rowIndex + additionalIndex, firstEditCol);
              event.api.clearRangeSelection();
              foundNonFooterRow = true;
            } else {
              let row: R = nextRowNode.data;
              if (row.meta.isGroupFooter === false) {
                event.api.setFocusedCell(event.rowIndex + additionalIndex, firstEditCol);
                event.api.clearRangeSelection();
                foundNonFooterRow = true;
              } else {
                additionalIndex = additionalIndex + 1;
              }
            }
          }
        }
      }
    }
  });

  const getTableChangeFromEvent = (event: CellEditingStoppedEvent | CellValueChangedEvent): Table.RowChange | null => {
    const field = event.column.getColId();
    const row: R = event.node.data;
    // NOTE: We want to allow the setting of fields to `null` - so we just have to make sure it is
    // not `undefined`.
    if (event.newValue !== undefined) {
      if (event.oldValue === undefined || event.oldValue !== event.newValue) {
        // NOTE: The old value will have already been processed in the HTTP type case.
        let newValue = event.newValue;
        if (!isNil(processors)) {
          newValue = processCell(
            processors,
            { type: "http", field: field as keyof R },
            event.newValue,
            row,
            event.colDef
          );
        }
        return {
          id: event.data.id,
          data: { [field]: { oldValue: event.oldValue, newValue } }
        };
      }
    }
    return null;
  };

  const onPasteStart = useDynamicCallback((event: PasteStartEvent) => {
    setCellChangeEvents([]);
  });

  const onPasteEnd = useDynamicCallback((event: PasteEndEvent) => {
    if (!isNil(onRowBulkUpdate)) {
      if (cellChangeEvents.length === 1) {
        const tableChange = getTableChangeFromEvent(cellChangeEvents[0]);
        if (!isNil(tableChange)) {
          onRowUpdate(tableChange);
        }
      } else if (cellChangeEvents.length !== 0) {
        const changes = filter(
          map(cellChangeEvents, (e: CellValueChangedEvent) => getTableChangeFromEvent(e)),
          (change: Table.RowChange | null) => change !== null
        ) as Table.RowChange[];
        if (changes.length !== 0) {
          onRowBulkUpdate(changes);
        }
      }
    }
  });

  const onCellValueChanged = useDynamicCallback((event: CellValueChangedEvent) => {
    if (event.source === "paste") {
      setCellChangeEvents([...cellChangeEvents, event]);
    } else {
      const tableChange = getTableChangeFromEvent(event);
      if (!isNil(tableChange)) {
        onRowUpdate(tableChange);
      }
    }
  });

  const getRowClass = (params: RowClassParams) => {
    if (params.node.data.meta.isGroupFooter === true) {
      let colorClass = params.node.data.group.color;
      if (colorClass.startsWith("#")) {
        colorClass = params.node.data.group.color.slice(1);
      }
      return classNames("row--group-footer", `bg-${colorClass}`);
    }
  };

  const getContextMenuItems = useDynamicCallback((params: GetContextMenuItemsParams): MenuItemDef[] => {
    // This can happen in rare cases where you right click outside of a cell.
    if (isNil(params.node)) {
      return [];
    }
    const row: R = params.node.data;
    if (row.meta.isTableFooter) {
      return [];
    } else if (row.meta.isGroupFooter) {
      if (!isNil(row.group) && !isNil(groupParams)) {
        const group = row.group;
        return [
          {
            name: `Delete Group ${group.name}`,
            action: () => groupParams.onDeleteGroup(group)
          }
        ];
      }
      return [];
    } else {
      const deleteRowContextMenuItem: MenuItemDef = {
        name: `Delete ${row.meta.typeLabel} ${row.meta.label}`,
        action: () => onRowDelete(row)
      };
      if (isNil(groupParams) || row.meta.isPlaceholder) {
        return [deleteRowContextMenuItem];
      } else if (!isNil(row.group)) {
        return [
          deleteRowContextMenuItem,
          {
            name: `Remove ${row.meta.typeLabel} ${row.meta.label} from Group ${row.group.name}`,
            action: () => groupParams.onRowRemoveFromGroup(row)
          }
        ];
      } else {
        const groupableNodesAbove = findRowsUpUntilFirstGroupFooterRow(params.node);
        let label: string;
        if (groupableNodesAbove.length === 1) {
          label = `Group ${groupableNodesAbove[0].data.meta.typeLabel} ${groupableNodesAbove[0].data.meta.label}`;
        } else {
          label = `Group ${groupableNodesAbove[0].data.meta.typeLabel}s ${
            groupableNodesAbove[groupableNodesAbove.length - 1].data.meta.label
          } - ${groupableNodesAbove[0].data.meta.label}`;
        }
        return [
          deleteRowContextMenuItem,
          {
            name: label,
            action: () => groupParams.onGroupRows(map(groupableNodesAbove, (node: RowNode) => node.data as R))
          }
        ];
      }
    }
  });

  useEffect(() => {
    if (renderFlag === true) {
      const getGroupForModel = (model: M): number | null => {
        const group: G | undefined = find(groups, (g: G) =>
          includes(
            map(g.children, (child: any) => child.id),
            model.id
          )
        );
        return !isNil(group) ? group.id : null;
      };

      const modelsWithGroup = filter(data, (m: M) => !isNil(getGroupForModel(m)));
      let modelsWithoutGroup = filter(data, (m: M) => isNil(getGroupForModel(m)));
      const groupedModels: { [key: number]: M[] } = groupBy(modelsWithGroup, (model: M) => getGroupForModel(model));

      const newTable: R[] = [];
      forEach(groupedModels, (models: M[], groupId: string) => {
        const group: G | undefined = find(groups, { id: parseInt(groupId) } as any);
        if (!isNil(group)) {
          const footer: R = createGroupFooter(group);
          newTable.push(
            ...orderByFieldOrdering(
              map(models, (m: M) => mapping.modelToRow(m, group, { selected: includes(selected, m.id) })),
              ordering
            ),
            {
              ...footer,
              group,
              [identifierField]: group.name,
              meta: { ...footer.meta, isGroupFooter: true }
            }
          );
        } else {
          // In the case that the group no longer exists, that means the group was removed from the
          // state.  In this case, we want to disassociate the rows with the group.
          modelsWithoutGroup = [...modelsWithoutGroup, ...models];
        }
      });
      setTable([
        ...newTable,
        ...orderByFieldOrdering(
          [
            ...map(modelsWithoutGroup, (m: M) => mapping.modelToRow(m, null, { selected: includes(selected, m.id) })),
            ...map(placeholders, (r: R) => ({ ...r, meta: { ...r.meta, selected: includes(selected, r.id) } }))
          ],
          ordering
        )
      ]);
    }
  }, [
    useDeepEqualMemo(data),
    useDeepEqualMemo(placeholders),
    useDeepEqualMemo(selected),
    useDeepEqualMemo(groups),
    useDeepEqualMemo(ordering),
    renderFlag
  ]);

  useEffect(() => {
    if (!isNil(columnApi) && !isNil(gridApi)) {
      const firstEditCol = columnApi.getAllDisplayedColumns()[2];
      if (!isNil(firstEditCol) && focused === false) {
        gridApi.ensureIndexVisible(0);
        gridApi.ensureColumnVisible(firstEditCol);
        setTimeout(() => gridApi.setFocusedCell(0, firstEditCol), 500);
        // TODO: Investigate if there is a better way to do this - currently,
        // this hook is getting triggered numerous times when it shouldn't be.
        // It is because the of the `columns` in the dependency array, which
        // are necessary to get a situation when `firstEditCol` is not null,
        // but also shouldn't be triggering this hook so many times.
        setFocused(true);
      }
    }
  }, [columnApi, gridApi, focused]);

  useEffect(() => {
    if (!isNil(gridApi)) {
      gridApi.setQuickFilter(search);
    }
  }, [search, gridApi]);

  useEffect(() => {
    if (!isNil(gridApi) && !isNil(rowRefreshRequired)) {
      gridApi.forEachNode((node: RowNode) => {
        const existing: R | undefined = find(table, { id: node.data.id });
        if (!isNil(existing)) {
          // TODO: We should figure out how to configure the API to just refresh the row at the
          // relevant column.
          if (rowRefreshRequired(existing, node.data)) {
            gridApi.refreshCells({ force: true, rowNodes: [node] });
          }
        }
      });
    }
  }, [useDeepEqualMemo(table), gridApi, rowRefreshRequired]);

  useEffect(() => {
    // Changes to the state of the selected rows does not trigger a refresh of those cells via AG
    // Grid because AG Grid cannot detect changes to the values of cells when the cell is HTML based.
    if (!isNil(gridApi) && !isNil(columnApi)) {
      gridApi.forEachNode((node: RowNode) => {
        const existing: R | undefined = find(table, { id: node.data.id });
        if (!isNil(existing)) {
          if (existing.meta.selected !== node.data.meta.selected) {
            const cols = columnApi.getAllColumns();
            const selectCol = find(cols, (col: Column) => {
              const def = col.getColDef();
              if (def.field === "index") {
                return true;
              }
              return false;
            });
            if (!isNil(selectCol)) {
              gridApi.refreshCells({ force: true, rowNodes: [node], columns: [selectCol] });
            }
          }
        }
      });
    }
  }, [useDeepEqualMemo(table), gridApi, columnApi]);

  useEffect(() => {
    // Changes to the errors in the rows does not trigger a refresh of those cells via AG Grid
    // because AG Grid cannot detect changes in that type of data structure for the row.
    if (!isNil(gridApi) && !isNil(columnApi)) {
      gridApi.forEachNode((node: RowNode) => {
        const existing: R | undefined = find(table, { id: node.data.id });
        if (!isNil(existing)) {
          // TODO: We might want to do a deeper comparison in the future here.
          if (existing.meta.errors.length !== node.data.meta.errors.length) {
            const cols = columnApi.getAllColumns();
            forEach(cols, (col: Column) => {
              const colDef = col.getColDef();
              if (!isNil(colDef.field)) {
                const cellErrors = filter(existing.meta.errors, { id: node.data.id, field: colDef.field });
                if (cellErrors.length !== 0) {
                  col.setColDef({ ...colDef, cellClass: "cell--error" }, null);
                  gridApi.refreshCells({ force: true, rowNodes: [node], columns: [col] });
                }
              }
            });
          }
        }
      });
    }
  }, [useDeepEqualMemo(table), gridApi, columnApi]);

  useEffect(() => {
    const mapped = map(table, (row: R) => row.meta.selected);
    const uniques = uniq(mapped);
    if (uniques.length === 1 && uniques[0] === true) {
      setAllSelected(true);
    } else {
      setAllSelected(false);
    }
  }, [useDeepEqualMemo(table)]);

  useEffect(() => {
    const cols = concat(
      baseColumns,
      map(bodyColumns, (def: ColDef) => bodyCell(def)),
      map(calculatedColumns, (def: ColDef) => calculatedCell(def))
    );
    setColDefs(
      map(cols, (col: ColDef, index: number) => {
        if (index === cols.length - 1) {
          return universalCell({ ...col, resizable: false });
        }
        return universalCell(col);
      })
    );
  }, [useDeepEqualMemo(bodyColumns), useDeepEqualMemo(calculatedColumns)]);

  useEffect(() => {
    setBudgetFooterColDefs(
      map(
        concat(
          baseColumns,
          map(bodyColumns, (def: ColDef) => bodyCell(def)),
          map(calculatedColumns, (def: ColDef) => calculatedCell(def))
        ),
        (col: ColDef) => universalCell(col)
      )
    );
  }, [useDeepEqualMemo(bodyColumns), useDeepEqualMemo(calculatedColumns)]);

  return (
    <React.Fragment>
      <TableHeader
        search={search}
        setSearch={(value: string) => onSearch(value)}
        columns={[...bodyColumns, ...calculatedColumns]}
        onDelete={() => {
          forEach(table, (row: R) => {
            if (row.meta.selected === true) {
              onRowDelete(row);
            }
          });
        }}
        saving={saving}
        selected={allSelected}
        onSelect={onSelectAll}
        deleteDisabled={filter(table, (row: R) => row.meta.selected === true).length === 0}
        onExport={(fields: Field[]) => {
          if (!isNil(gridApi) && !isNil(columnApi)) {
            const includeColumn = (col: Column): boolean => {
              const colDef = col.getColDef();
              return (
                !isNil(colDef.field) &&
                includes(
                  map(fields, (field: Field) => field.id),
                  colDef.field
                ) &&
                includes(
                  map([...bodyColumns, ...calculatedColumns], (c: ColDef) => c.field),
                  colDef.field
                )
              );
            };

            const cols = filter(columnApi.getAllColumns(), (col: Column) => includeColumn(col));
            const headerRow: CSVRow = [];
            forEach(cols, (col: Column) => {
              const colDef = col.getColDef();
              if (!isNil(colDef.field)) {
                headerRow.push(colDef.headerName);
              }
            });

            const csvData: CSVData = [headerRow];

            gridApi.forEachNode((node: RowNode, index: number) => {
              const row: CSVRow = [];
              forEach(cols, (col: Column) => {
                const colDef = col.getColDef();
                if (!isNil(colDef.field)) {
                  if (isNil(node.data[colDef.field])) {
                    row.push("");
                  } else {
                    let value = node.data[colDef.field];
                    if (!isNil(getExportValue) && !isNil(getExportValue[colDef.field])) {
                      value = getExportValue[colDef.field]({
                        node,
                        colDef,
                        value
                      });
                    }
                    // TODO: Use a valueSetter instead of a formatter on the cell renderer.
                    if (!isNil(colDef.cellRendererParams) && !isNil(colDef.cellRendererParams.formatter)) {
                      value = colDef.cellRendererParams.formatter(value);
                    }
                    row.push(value);
                  }
                }
              });
              csvData.push(row);
            });
            let fileName = "make-me-current-date";
            if (!isNil(exportFileName)) {
              fileName = exportFileName;
            }
            downloadAsCsvFile(fileName, csvData);
          }
        }}
        onColumnsChange={(fields: Field[]) => {
          if (!isNil(columnApi) && !isNil(tableFooterColumnApi) && !isNil(budgetFooterColumnApi)) {
            forEach([...bodyColumns, ...calculatedColumns], (col: ColDef) => {
              if (!isNil(col.field)) {
                const associatedField = find(fields, { id: col.field });
                if (!isNil(associatedField)) {
                  columnApi.setColumnVisible(col.field, true);
                  tableFooterColumnApi.setColumnVisible(col.field, true);
                  budgetFooterColumnApi.setColumnVisible(col.field, true);
                } else {
                  columnApi.setColumnVisible(col.field, false);
                  tableFooterColumnApi.setColumnVisible(col.field, false);
                  budgetFooterColumnApi.setColumnVisible(col.field, false);
                }
              }
            });
          }
        }}
      />
      <RenderWithSpinner absolute loading={loading}>
        <div className={"budget-table ag-theme-alpine"}>
          <div className={"table-grid"}>
            <AgGridReact
              {...gridOptions}
              columnDefs={colDefs}
              getContextMenuItems={getContextMenuItems}
              allowContextMenuWithControlKey={true}
              rowData={table}
              debug={TABLE_DEBUG}
              getRowNodeId={(r: any) => r.id}
              getRowClass={getRowClass}
              immutableData={true}
              suppressRowClickSelection={true}
              onGridReady={onGridReady}
              rowHeight={36}
              headerHeight={38}
              enableRangeSelection={true}
              animateRows={true}
              navigateToNextCell={navigateToNextCell}
              onCellKeyDown={onCellKeyDown}
              onFirstDataRendered={onFirstDataRendered}
              suppressKeyboardEvent={suppressNavigation}
              // NOTE: This might not be 100% necessary, because of how efficiently
              // we are managing the state updates to the data that flows into the table.
              // However, for now we will leave.  It is important to note that this will
              // cause the table renders to be slower for large datasets.
              rowDataChangeDetectionStrategy={ChangeDetectionStrategyType.DeepValueCheck}
              enterMovesDown={false}
              frameworkComponents={{
                ExpandCell: ExpandCell,
                IndexCell: IndexCell,
                ValueCell: IncludeErrorsInCell<R>(ValueCell),
                SubAccountUnitCell: IncludeErrorsInCell<R>(SubAccountUnitCell),
                FringeUnitCell: IncludeErrorsInCell<R>(FringeUnitCell),
                IdentifierCell: IncludeErrorsInCell<R>(IdentifierCell),
                CalculatedCell: CalculatedCell,
                PaymentMethodsCell: HideCellForAllFooters<R>(PaymentMethodsCell),
                BudgetItemCell: HideCellForAllFooters<R>(BudgetItemCell),
                FringesCell: ShowCellOnlyForRowType<R>("subaccount")(IncludeErrorsInCell<R>(FringesCell)),
                agColumnHeader: HeaderCell,
                ...frameworkComponents
              }}
              onPasteStart={onPasteStart}
              onPasteEnd={onPasteEnd}
              onCellValueChanged={onCellValueChanged}
            />
          </div>
          <div className={"table-footer-grid"}>
            <AgGridReact
              {...tableFooterGridOptions}
              columnDefs={colDefs}
              rowData={[tableFooter]}
              rowHeight={38}
              rowClass={"row--table-footer"}
              suppressRowClickSelection={true}
              onGridReady={onTableFooterGridReady}
              onFirstDataRendered={onTableFooterFirstDataRendered}
              headerHeight={0}
              frameworkComponents={{
                IndexCell: IndexCell,
                ValueCell: IncludeErrorsInCell<R>(ValueCell),
                IdentifierCell: IncludeErrorsInCell<R>(IdentifierCell),
                CalculatedCell: CalculatedCell,
                ...frameworkComponents
              }}
            />
          </div>
          <ShowHide show={!isNil(budgetTotals)}>
            <div className={"budget-footer-grid"}>
              <AgGridReact
                {...budgetFooterGridOptions}
                columnDefs={budgetFooterColDefs}
                rowData={[budgetFooter]}
                rowClass={"row--budget-footer"}
                suppressRowClickSelection={true}
                onGridReady={onBudgetFooterGridReady}
                onFirstDataRendered={onBudgetFooterFirstDataRendered}
                headerHeight={0}
                rowHeight={28}
                frameworkComponents={{
                  IndexCell: IndexCell,
                  ValueCell: IncludeErrorsInCell<R>(ValueCell),
                  IdentifierCell: IncludeErrorsInCell<R>(IdentifierCell),
                  CalculatedCell: CalculatedCell,
                  ...frameworkComponents
                }}
              />
            </div>
          </ShowHide>
        </div>
      </RenderWithSpinner>
    </React.Fragment>
  );
};

export default BudgetTable;
