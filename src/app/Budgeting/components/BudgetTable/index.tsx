import React, { useState, useEffect, useMemo } from "react";
import classNames from "classnames";
import { map, isNil, includes, find, concat, reduce, forEach, filter, groupBy } from "lodash";
import Cookies from "universal-cookie";

import {
  ColDef,
  CellClassParams,
  GridApi,
  RowNode,
  EditableCallbackParams,
  ColumnApi,
  Column,
  ColSpanParams,
  GridOptions
} from "@ag-grid-community/core";

import { TABLE_DEBUG, TABLE_PINNING_ENABLED } from "config";
import { RenderWithSpinner } from "components";
import { useDynamicCallback, useDeepEqualMemo } from "lib/hooks";
import { hashString, updateFieldOrdering, orderByFieldOrdering, getKeyValue } from "lib/util";
import { downloadAsCsvFile } from "lib/util/files";
import { currencyValueFormatter } from "lib/tabling/formatters";

import { BudgetTableProps, CellValueChangedParams, CustomColDef } from "./model";
import BudgetTableMenu from "./Menu";
import { validateCookiesOrdering, mergeClassNames, mergeClassNamesFn } from "./util";
import { BudgetFooterGrid, TableFooterGrid, PrimaryGrid } from "./grids";
import "./index.scss";

export * from "./cells";
export * from "./model";

const BudgetTable = <
  R extends Table.Row<G>,
  M extends Model.Model,
  G extends Model.Group = Model.Group,
  P extends Http.ModelPayload<M> = Http.ModelPayload<M>
>({
  /* eslint-disable indent */
  columns,
  data,
  actions,
  className,
  style = {},
  placeholders = [],
  groups = [],
  selected,
  manager,
  search,
  loading,
  loadingBudget,
  saving,
  frameworkComponents = {},
  exportFileName,
  nonEditableCells,
  groupParams,
  cookies,
  identifierField,
  identifierFieldHeader,
  identifierColumn = {},
  actionColumn = {},
  expandColumn = {},
  indexColumn = {},
  tableFooterIdentifierValue = "Grand Total",
  budgetFooterIdentifierValue = "Budget Total",
  sizeColumnsToFit = true,
  renderFlag = true,
  canSearch = true,
  canExport = true,
  canToggleColumns = true,
  detached = false,
  rowCanExpand,
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
  ...options
}: BudgetTableProps<R, M, G, P>) => {
  const [table, setTable] = useState<R[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [ordering, setOrdering] = useState<FieldOrder<keyof R>[]>([]);
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);
  const [columnApi, setColumnApi] = useState<ColumnApi | undefined>(undefined);
  const [colDefs, setColDefs] = useState<CustomColDef<R, G>[]>([]);
  const [tableFooterColumnApi, setTableFooterColumnApi] = useState<ColumnApi | undefined>(undefined);
  const [budgetFooterColumnApi, setBudgetFooterColumnApi] = useState<ColumnApi | undefined>(undefined);
  const [gridOptions, setGridOptions] = useState<GridOptions>({
    alignedGrids: [],
    defaultColDef: {
      resizable: true,
      sortable: false,
      filter: false,
      suppressMovable: true
    },
    suppressHorizontalScroll: true,
    suppressContextMenu: process.env.NODE_ENV === "development" && TABLE_DEBUG,
    suppressCopyRowsToClipboard: isNil(onRowBulkUpdate),
    suppressClipboardPaste: isNil(onRowBulkUpdate),
    enableFillHandle: true,
    fillHandleDirection: "y",
    ...options
  });
  const [tableFooterGridOptions, setTableFooterGridOptions] = useState<GridOptions>({
    alignedGrids: [],
    defaultColDef: {
      resizable: false,
      sortable: false,
      filter: false,
      editable: false,
      cellClass: "cell--not-editable",
      suppressMovable: true
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
      cellClass: "cell--not-editable",
      suppressMovable: true
    },
    suppressContextMenu: true,
    suppressHorizontalScroll: true
  });

  const _isCellSelectable = useDynamicCallback<boolean>((row: R, colDef: ColDef | CustomColDef<R, G>): boolean => {
    if (includes(["index", "expand"], colDef.field)) {
      return false;
    } else if (row.meta.isTableFooter === true || row.meta.isGroupFooter === true || row.meta.isBudgetFooter) {
      return false;
    } else if (!isNil(isCellSelectable)) {
      return isCellSelectable(row, colDef);
    }
    return true;
  });

  const _isCellEditable = useDynamicCallback<boolean>((row: R, colDef: ColDef | CustomColDef<R, G>): boolean => {
    if (includes(["index", "expand"], colDef.field)) {
      return false;
    } else if (row.meta.isTableFooter === true || row.meta.isGroupFooter === true || row.meta.isBudgetFooter) {
      return false;
    } else if (!isNil(nonEditableCells) && includes(nonEditableCells, colDef.field as keyof R)) {
      return false;
    } else if (
      includes(
        map(
          filter(columns, (c: CustomColDef<R, G>) => c.isCalculated === true),
          (col: CustomColDef<R, G>) => col.field
        ),
        colDef.field
      )
    ) {
      return false;
    } else if (!isNil(isCellEditable)) {
      return isCellEditable(row, colDef);
    }
    return true;
  });

  const actionCell = useDynamicCallback<CustomColDef<R, G>>(
    (col: CustomColDef<R, G>): CustomColDef<R, G> => {
      return {
        ...col,
        cellClass: mergeClassNamesFn("cell--action", "cell--not-editable", "cell--not-selectable", col.cellClass),
        editable: false,
        headerName: "",
        resizable: false
      };
    }
  );

  const indexCell = useDynamicCallback<CustomColDef<R, G>>(
    (col: CustomColDef<R, G>): CustomColDef<R, G> =>
      actionCell({
        ...actionColumn,
        ...indexColumn,
        field: "index",
        cellRenderer: "IndexCell",
        width: isNil(onRowExpand) ? 40 : 30,
        maxWidth: isNil(onRowExpand) ? 40 : 30,
        pinned: TABLE_PINNING_ENABLED === true ? "left" : undefined,
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

  const identifierCell = useDynamicCallback<CustomColDef<R, G>>(
    (col: CustomColDef<R, G>): CustomColDef<R, G> => ({
      field: identifierField,
      headerName: identifierFieldHeader,
      cellRenderer: "IdentifierCell",
      width: 100,
      ...identifierColumn,
      pinned: TABLE_PINNING_ENABLED === true ? "left" : undefined,
      colSpan: (params: ColSpanParams) => {
        const row: R = params.data;
        if (row.meta.isGroupFooter === true || row.meta.isTableFooter === true || row.meta.isBudgetFooter) {
          return filter(columns, (c: CustomColDef<R, G>) => !(c.isCalculated === true)).length + 1;
        } else if (!isNil(identifierColumn.colSpan)) {
          return identifierColumn.colSpan(params);
        }
        return 1;
      },
      cellRendererParams: {
        ...identifierColumn.cellRendererParams,
        onGroupEdit: groupParams?.onEditGroup
      }
    })
  );

  const expandCell = useDynamicCallback<CustomColDef<R, G>>(
    (col: CustomColDef<R, G>): CustomColDef<R, G> =>
      actionCell({
        width: 30,
        maxWidth: 30,
        ...expandColumn,
        ...col,
        field: "expand",
        cellRenderer: "ExpandCell",
        pinned: TABLE_PINNING_ENABLED === true ? "left" : undefined,
        cellRendererParams: {
          ...expandColumn.cellRendererParams,
          ...col.cellRendererParams,
          onClick: onRowExpand,
          rowCanExpand
        },
        cellClass: mergeClassNamesFn(col.cellClass, expandColumn.cellClass, actionColumn.cellClass)
      })
  );

  const calculatedCell = useDynamicCallback<CustomColDef<R, G>>(
    (col: CustomColDef<R, G>): CustomColDef<R, G> => {
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

  const onSort = useDynamicCallback<void>((order: Order, field: keyof R) => {
    const newOrdering = updateFieldOrdering(ordering, field, order);
    setOrdering(newOrdering);
    if (!isNil(cookies) && !isNil(cookies.ordering)) {
      const kookies = new Cookies();
      kookies.set(cookies.ordering, newOrdering);
    }
  });

  const bodyCell = useDynamicCallback<CustomColDef<R, G>>(
    (col: CustomColDef<R, G>): CustomColDef<R, G> => {
      return {
        cellRenderer: "ValueCell",
        headerComponentParams: {
          onSort: onSort,
          ordering
        },
        ...col
      };
    }
  );

  const universalCell = useDynamicCallback<CustomColDef<R, G>>(
    (col: CustomColDef<R, G>): CustomColDef<R, G> => {
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

  const baseColumns = useMemo((): CustomColDef<R, G>[] => {
    let baseLeftColumns: CustomColDef<R, G>[] = [indexCell({})];
    if (!isNil(onRowExpand)) {
      // This cell will be hidden for the table footer since the previous index
      // cell will span over this column.
      baseLeftColumns.push(expandCell({}));
    }
    baseLeftColumns.push(identifierCell({}));
    return baseLeftColumns;
  }, [onRowExpand]);

  useEffect(() => {
    setGridOptions({
      ...gridOptions,
      alignedGrids: [tableFooterGridOptions, budgetFooterGridOptions]
    });
    setBudgetFooterGridOptions({ ...budgetFooterGridOptions, alignedGrids: [gridOptions, tableFooterGridOptions] });
    setTableFooterGridOptions({ ...tableFooterGridOptions, alignedGrids: [gridOptions, budgetFooterGridOptions] });
  }, []);

  useEffect(() => {
    if (!isNil(cookies) && !isNil(cookies.ordering)) {
      const kookies = new Cookies();
      const cookiesOrdering = kookies.get(cookies.ordering);
      const validatedOrdering = validateCookiesOrdering(
        cookiesOrdering,
        filter(columns, (col: CustomColDef<R, G>) => !(col.isCalculated === true))
      );
      if (!isNil(validatedOrdering)) {
        setOrdering(validatedOrdering);
      }
    }
  }, [useDeepEqualMemo(cookies)]);

  useEffect(() => {
    const cols = concat(
      baseColumns,
      map(
        filter(columns, (col: CustomColDef<R, G>) => !(col.isCalculated === true)),
        (def: CustomColDef<R, G>) => bodyCell(def)
      ),
      map(
        filter(columns, (col: CustomColDef<R, G>) => col.isCalculated === true),
        (def: CustomColDef<R, G>) => calculatedCell(def)
      )
    );
    setColDefs(
      map(cols, (col: CustomColDef<R, G>, index: number) => {
        if (index === cols.length - 1) {
          return universalCell({ ...col, resizable: false });
        }
        return universalCell(col);
      })
    );
  }, [useDeepEqualMemo(columns), baseColumns]);

  useEffect(() => {
    const createGroupFooter = (group: G): R => {
      return reduce(
        columns,
        (obj: { [key: string]: any }, col: CustomColDef<R, G>) => {
          if (!isNil(col.field)) {
            if (col.isCalculated === true) {
              if (!isNil(group[col.field as keyof G])) {
                obj[col.field] = group[col.field as keyof G];
              } else {
                obj[col.field] = null;
              }
            } else {
              obj[col.field] = null;
            }
          }
          return obj;
        },
        {
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
        }
      ) as R;
    };
    if (renderFlag === true) {
      const getGroupForModel = (model: M): number | null => {
        const group: G | undefined = find(groups, (g: G) =>
          includes(
            map(g.children, (child: number) => child),
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
              map(models, (m: M) => manager.modelToRow(m, group, { selected: includes(selected, m.id) })),
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
            ...map(modelsWithoutGroup, (m: M) => manager.modelToRow(m, null, { selected: includes(selected, m.id) })),
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

  const processCellForClipboard = useDynamicCallback((column: Column, row: R, value?: any) => {
    const colDef = column.getColDef();
    if (!isNil(colDef.field)) {
      const customColDef: CustomColDef<R, G> | undefined = find(colDefs, { field: colDef.field } as any);
      if (!isNil(customColDef)) {
        const processor = customColDef.processCellForClipboard;
        if (!isNil(processor)) {
          return processor(row);
        } else {
          value = value === undefined ? getKeyValue<R, keyof R>(customColDef.field)(row) : value;
          // The value should never be undefined at this point.
          if (value === customColDef.nullValue) {
            return "";
          }
          return value;
        }
      }
    }
    return "";
  });

  const processCellForExport = useDynamicCallback((column: Column, row: R, value?: any) => {
    const colDef = column.getColDef();
    if (!isNil(colDef.field)) {
      const customColDef: CustomColDef<R, G> | undefined = find(colDefs, { field: colDef.field } as any);
      if (!isNil(customColDef)) {
        const processor = customColDef.processCellForExport;
        if (!isNil(processor)) {
          return processor(row);
        } else {
          return processCellForClipboard(column, row, value);
        }
      }
    }
    return "";
  });

  const processCellFromClipboard = useDynamicCallback((column: Column, row: R, value?: any) => {
    const colDef = column.getColDef();
    if (!isNil(colDef.field)) {
      const customColDef: CustomColDef<R, G> | undefined = find(colDefs, { field: colDef.field } as any);
      if (!isNil(customColDef)) {
        const processor = customColDef.processCellFromClipboard;
        if (!isNil(processor)) {
          return processor(value);
        } else {
          value = value === undefined ? getKeyValue<R, keyof R>(customColDef.field)(row) : value;
          // The value should never be undefined at this point.
          if (typeof value === "string" && String(value).trim() === "") {
            return !isNil(customColDef.nullValue) ? customColDef.nullValue : null;
          }
          return value;
        }
      }
    }
    return "";
  });

  const onCellValueChanged = useDynamicCallback((params: CellValueChangedParams<R, G>) => {
    if (!isNil(gridApi) && !isNil(columnApi) && !isNil(onRowExpand) && !isNil(rowCanExpand)) {
      const col = columnApi.getColumn("expand");
      if (!isNil(col)) {
        if (isNil(params.oldRow) || rowCanExpand(params.oldRow) !== rowCanExpand(params.row)) {
          gridApi.refreshCells({ force: true, rowNodes: [params.node], columns: [col] });
        }
      }
    }
  });

  return (
    <React.Fragment>
      <BudgetTableMenu<R, G>
        actions={actions}
        search={search}
        onSearch={onSearch}
        canSearch={canSearch}
        canExport={canExport}
        canToggleColumns={canToggleColumns}
        columns={columns}
        onDelete={() => {
          forEach(table, (row: R) => {
            if (row.meta.selected === true) {
              onRowDelete(row);
            }
          });
        }}
        detached={detached}
        saving={saving}
        selected={allSelected}
        onSelectAll={onSelectAll}
        selectedRows={filter(table, (row: R) => row.meta.selected === true)}
        onExport={(fields: Field[]) => {
          if (!isNil(gridApi) && !isNil(columnApi)) {
            const includeColumn = (col: Column): boolean => {
              const colDef = col.getColDef();
              if (!isNil(colDef.field)) {
                const customColDef: CustomColDef<R, G> | undefined = find(colDefs, { field: colDef.field } as any);
                if (!isNil(customColDef)) {
                  return (
                    customColDef.excludeFromExport !== true &&
                    includes(
                      map(fields, (field: Field) => field.id),
                      customColDef.field
                    )
                  );
                }
              }
              return false;
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
                if (!isNil(node.data)) {
                  row.push(processCellForExport(col, node.data as R));
                } else {
                  row.push("");
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
            forEach(columns, (col: CustomColDef<R, G>) => {
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
      <RenderWithSpinner loading={loading}>
        <div className={classNames("budget-table ag-theme-alpine", className)} style={style}>
          <PrimaryGrid<R, G>
            api={gridApi}
            columnApi={columnApi}
            identifierField={identifierField}
            table={table}
            colDefs={colDefs}
            options={gridOptions}
            groups={groups}
            groupParams={groupParams}
            frameworkComponents={frameworkComponents}
            sizeColumnsToFit={sizeColumnsToFit}
            search={search}
            onCellValueChanged={onCellValueChanged}
            setApi={setGridApi}
            setColumnApi={setColumnApi}
            processCellForClipboard={processCellForClipboard}
            processCellFromClipboard={processCellFromClipboard}
            setAllSelected={setAllSelected}
            isCellEditable={_isCellEditable}
            onRowExpand={onRowExpand}
            rowCanExpand={rowCanExpand}
            onRowUpdate={onRowUpdate}
            onRowBulkUpdate={onRowBulkUpdate}
            onRowAdd={onRowAdd}
            onRowDelete={onRowDelete}
            onBack={onBack}
          />
          <TableFooterGrid<R, G>
            options={tableFooterGridOptions}
            colDefs={colDefs}
            columns={columns}
            sizeColumnsToFit={sizeColumnsToFit}
            frameworkComponents={frameworkComponents}
            identifierField={identifierField}
            identifierValue={tableFooterIdentifierValue}
            setColumnApi={setTableFooterColumnApi}
          />
          {filter(columns, (col: CustomColDef<R, G>) => col.isCalculated === true && !isNil(col.budgetTotal)).length !==
            0 && (
            <BudgetFooterGrid<R, G>
              options={budgetFooterGridOptions}
              colDefs={colDefs}
              columns={columns}
              sizeColumnsToFit={sizeColumnsToFit}
              frameworkComponents={frameworkComponents}
              identifierField={identifierField}
              identifierValue={budgetFooterIdentifierValue}
              loadingBudget={loadingBudget}
              setColumnApi={setBudgetFooterColumnApi}
            />
          )}
        </div>
      </RenderWithSpinner>
    </React.Fragment>
  );
};

export default BudgetTable;
