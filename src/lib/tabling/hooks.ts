import { useEffect, useState, useRef } from "react";
import Cookies from "universal-cookie";
import { isNil, filter, map } from "lodash";

import { ColumnApi, GridApi } from "@ag-grid-community/core";

import { util, hooks } from "lib";
import TableApis from "./apis";
import * as cookies from "./cookies";

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
        filter(params.columns, (col: Table.Column<R, M>) => col.tableColumnType !== "calculated")
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

export const InitialReadOnlyTableRef: Table.ReadOnlyTableRefObj<any, any> = {
  getCSVData: (fields?: string[]) => [],
  changeColumnVisibility: (changes: SingleOrArray<Table.ColumnVisibilityChange<any, any>>, sizeToFit?: boolean) => {}
};

export const InitialReadWriteTableRef: Table.ReadWriteTableRefObj<any, any> = {
  applyTableChange: (event: Table.ChangeEvent<any, any>) => {},
  ...InitialReadOnlyTableRef
};

export const InitialReadWriteBudgetTableRef: BudgetTable.ReadWriteTableRefObj<any, any> = {
  applyGroupColorChange: (group: Model.Group) => {},
  ...InitialReadWriteTableRef
};

export const useReadOnlyTable = <R extends Table.Row, M extends Model.Model>(): NonNullRef<
  Table.ReadOnlyTableRefObj<R, M>
> => {
  return useRef<Table.ReadOnlyTableRefObj<R, M>>(InitialReadWriteBudgetTableRef);
};

/* eslint-disable indent */
export const useReadOnlyTableIfNotDefined = <R extends Table.Row, M extends Model.Model>(
  grid?: NonNullRef<Table.ReadOnlyTableRefObj<R, M>>
): NonNullRef<Table.ReadOnlyTableRefObj<R, M>> =>
  hooks.useRefIfNotDefined<Table.ReadOnlyTableRefObj<R, M>>(useReadOnlyTable, grid);

export const useReadWriteTable = <R extends Table.Row, M extends Model.Model>(): NonNullRef<
  Table.ReadWriteTableRefObj<R, M>
> => {
  return useRef<Table.ReadWriteTableRefObj<R, M>>(InitialReadWriteBudgetTableRef);
};

export const useReadWriteTableIfNotDefined = <R extends Table.Row, M extends Model.Model>(
  grid?: NonNullRef<Table.ReadWriteTableRefObj<R, M>>
): NonNullRef<Table.ReadWriteTableRefObj<R, M>> =>
  hooks.useRefIfNotDefined<Table.ReadWriteTableRefObj<R, M>>(useReadWriteTable, grid);

export const useReadWriteBudgetTable = <R extends Table.Row, M extends Model.Model>(): NonNullRef<
  BudgetTable.ReadWriteTableRefObj<R, M>
> => {
  return useRef<BudgetTable.ReadWriteTableRefObj<R, M>>(InitialReadWriteBudgetTableRef);
};

export const useReadWriteBudgetTableIfNotDefined = <R extends Table.Row, M extends Model.Model>(
  grid?: NonNullRef<BudgetTable.ReadWriteTableRefObj<R, M>>
): NonNullRef<BudgetTable.ReadWriteTableRefObj<R, M>> =>
  hooks.useRefIfNotDefined<BudgetTable.ReadWriteTableRefObj<R, M>>(useReadWriteBudgetTable, grid);
