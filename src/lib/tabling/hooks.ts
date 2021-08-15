import { useRef, useEffect, useState, useMemo } from "react";
import Cookies from "universal-cookie";
import { isNil, filter, map } from "lodash";

import { ColumnApi, GridApi } from "@ag-grid-community/core";

import { util, hooks } from "lib";
import TableApis from "./apis";
import * as cookies from "./cookies";

export const InitialDataGridRef: Table.Grid<any, any> = {
  applyTableChange: (event: Table.ChangeEvent<any, any>) => {},
  getCSVData: (fields?: string[]) => []
};

export const InitialBudgetDataGridRef: BudgetTable.Grid<any, any> = {
  ...InitialDataGridRef,
  applyGroupColorChange: (group: Model.Group) => {}
};

export const InitialTableRef: Table.Table<any, any> = {
  ...InitialDataGridRef,
  changeColumnVisibility: (changes: SingleOrArray<Table.ColumnVisibilityChange<any, any>>, sizeToFit?: boolean) => {}
};

export const InitialBudgetTableRef: BudgetTable.Table<any, any> = {
  ...InitialBudgetDataGridRef,
  ...InitialTableRef
};

export const useGrid = <R extends Table.Row, M extends Model.Model>(): Table.GridRef<R, M> => {
  return useRef<Table.Grid<R, M>>(InitialDataGridRef);
};

export const useGridIfNotDefined = <R extends Table.Row, M extends Model.Model>(
  grid?: Table.GridRef<R, M>
): Table.GridRef<R, M> => {
  const ref = useRef<Table.Grid<R, M>>(InitialDataGridRef);
  const returnRef = useMemo(() => (!isNil(grid) ? grid : ref), [grid, ref.current]);
  return returnRef;
};

export const useBudgetGrid = <R extends BudgetTable.Row, M extends Model.Model>(): BudgetTable.GridRef<R, M> => {
  return useRef<BudgetTable.Grid<R, M>>(InitialBudgetDataGridRef);
};

export const useBudgetGridIfNotDefined = <R extends BudgetTable.Row, M extends Model.Model>(
  grid?: BudgetTable.GridRef<R, M>
): BudgetTable.GridRef<R, M> => {
  const ref = useRef<BudgetTable.Grid<R, M>>(InitialBudgetDataGridRef);
  const returnRef = useMemo(() => (!isNil(grid) ? grid : ref), [grid, ref.current]);
  return returnRef;
};

export const useTable = <R extends Table.Row, M extends Model.Model>(): Table.Ref<R, M> => {
  return useRef<Table.Table<R, M>>(InitialTableRef);
};

export const useTableIfNotDefined = <R extends Table.Row, M extends Model.Model>(
  table?: Table.Ref<R, M> | null
): Table.Ref<R, M> => {
  const ref = useRef<Table.Table<R, M>>(InitialBudgetTableRef);
  const returnRef = useMemo(() => (!isNil(table) ? table : ref), [table, ref.current]);
  return returnRef;
};

export const useBudgetTable = <R extends Table.Row, M extends Model.Model>(): BudgetTable.Ref<R, M> => {
  return useRef<BudgetTable.Table<R, M>>(InitialBudgetTableRef);
};

export const useBudgetTableIfNotDefined = <R extends BudgetTable.Row, M extends Model.Model>(
  table?: BudgetTable.Ref<R, M> | null
): BudgetTable.Ref<R, M> => {
  const ref = useRef<BudgetTable.Table<R, M>>(InitialBudgetTableRef);
  const returnRef = useMemo(() => (!isNil(table) ? table : ref), [table, ref.current]);
  return returnRef;
};

type UseOrderingParams<R extends Table.Row, M extends Model.Model> = {
  readonly cookie?: string;
  readonly columns: Table.Column<R, M>[];
};

type UseOrderingReturnType<R extends Table.Row> = [FieldOrder<keyof R>[], (order: Order, field: keyof R) => void];

export const useOrdering = <R extends Table.Row, M extends Model.Model>(
  params: UseOrderingParams<R, M>
): UseOrderingReturnType<R> => {
  const cookiesObj = new Cookies();
  // TODO: When the columns change, we also need to update the ordering
  // to account for columns that are no longer there.
  const [ordering, setOrdering] = useState<FieldOrder<keyof R>[]>([]);

  const updateOrdering = (order: Order, field: keyof R) => {
    const newOrdering = util.updateFieldOrdering(ordering, field, order);
    setOrdering(newOrdering);
    if (!isNil(params.cookie)) {
      cookiesObj.set(params.cookie, newOrdering);
    }
  };

  useEffect(() => {
    if (!isNil(params.cookie)) {
      const cookiesOrdering = cookiesObj.get(params.cookie);
      const validatedOrdering = cookies.validateOrdering(
        cookiesOrdering,
        filter(params.columns, (col: Table.Column<R, M>) => !(col.isCalculated === true))
      );
      if (!isNil(validatedOrdering)) {
        setOrdering(validatedOrdering);
      }
    }
  }, [params.cookie]);

  return [ordering, updateOrdering];
};

type UseHiddenColumnsParams<R extends Table.Row, M extends Model.Model> = {
  readonly cookie?: string;
  readonly validateAgainst?: Table.Field<R, M>[];
  readonly apis: TableApis;
};

type UseHiddenColumnsReturnType<R extends Table.Row, M extends Model.Model> = [
  Table.Field<R, M>[],
  (changes: SingleOrArray<Table.ColumnVisibilityChange<R, M>>, sizeToFit?: boolean) => void
];

export const useHiddenColumns = <R extends Table.Row, M extends Model.Model>(
  params: UseHiddenColumnsParams<R, M>
): UseHiddenColumnsReturnType<R, M> => {
  const [hiddenColumns, _setHiddenColumns] = useState<Table.Field<R, M>[]>([]);

  useEffect(() => {
    if (!isNil(params.cookie)) {
      _setHiddenColumns(cookies.getHiddenColumns(params.cookie, params.validateAgainst));
    }
  }, [params.cookie]);

  const changeColumnVisibility = hooks.useDynamicCallback(
    (changes: SingleOrArray<Table.ColumnVisibilityChange<R, M>>, sizeToFit?: boolean) => {
      const arrayOfChanges = Array.isArray(changes) ? changes : [changes];
      map(arrayOfChanges, (change: Table.ColumnVisibilityChange<R, M>) =>
        params.apis.columnMap((api: ColumnApi) => api.setColumnVisible(change.field as string, change.visible))
      );
      if (sizeToFit !== false) {
        params.apis.gridMap((api: GridApi) => api.sizeColumnsToFit());
      }
      const newHiddenColumns = cookies.applyHiddenColumnChanges(changes, hiddenColumns);
      _setHiddenColumns(newHiddenColumns);
      if (!isNil(params.cookie)) {
        cookies.setHiddenColumns(params.cookie, newHiddenColumns);
      }
    }
  );

  return [hiddenColumns, changeColumnVisibility];
};
