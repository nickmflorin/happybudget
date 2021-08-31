import { useEffect, useState, useRef } from "react";
import Cookies from "universal-cookie";
import { isNil, filter, map } from "lodash";

import { ColumnApi, GridApi } from "@ag-grid-community/core";

import * as hooks from "../hooks";
import * as util from "../util";
import TableApis from "./apis";
import * as cookies from "./cookies";

type UseOrderingParams<R extends Table.RowData, M extends Model.Model = Model.Model> = {
  readonly cookie?: string;
  readonly columns: Table.Column<R, M>[];
};

type UseOrderingReturnType<R extends Table.RowData> = [FieldOrder<keyof R>[], (order: Order, field: keyof R) => void];

export const useOrdering = <R extends Table.RowData, M extends Model.Model = Model.Model>(
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

type UseHiddenColumnsParams<R extends Table.RowData, M extends Model.Model = Model.Model> = {
  readonly cookie?: string;
  readonly columns: Table.Column<R, M>[];
  readonly apis: TableApis;
};

type UseHiddenColumnsReturnType<R extends Table.RowData> = [
  (keyof R)[],
  (changes: SingleOrArray<Table.ColumnVisibilityChange<R>>, sizeToFit?: boolean) => void
];

export const useHiddenColumns = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  params: UseHiddenColumnsParams<R, M>
): UseHiddenColumnsReturnType<R> => {
  const [hiddenColumns, _setHiddenColumns] = useState<(keyof R)[]>([]);

  useEffect(() => {
    let setColumnsFromCookies = false;
    if (!isNil(params.cookie)) {
      const hiddenColumnsInCookies: (keyof R)[] | null = cookies.getHiddenColumns(
        params.cookie,
        map(
          filter(params.columns, (c: Table.Column<R, M>) => c.canBeHidden !== false),
          (c: Table.Column<R, M>) => c.field
        )
      );
      if (!isNil(hiddenColumnsInCookies)) {
        _setHiddenColumns(hiddenColumnsInCookies);
        setColumnsFromCookies = true;
      }
    }
    if (setColumnsFromCookies === false) {
      // If there the hidden columns are not stored in cookies or the hidden columns stored in
      // cookies are corrupted, we want to set the hidden columns based on the defaultHidden property.
      _setHiddenColumns(
        map(
          filter(params.columns, (c: Table.Column<R, M>) => c.canBeHidden !== false && c.defaultHidden === true),
          (c: Table.Column<R, M>) => c.field
        )
      );
    }
  }, [params.cookie]);

  const changeColumnVisibility = hooks.useDynamicCallback(
    (changes: SingleOrArray<Table.ColumnVisibilityChange<R>>, sizeToFit?: boolean) => {
      const arrayOfChanges = Array.isArray(changes) ? changes : [changes];
      map(arrayOfChanges, (change: Table.ColumnVisibilityChange<R>) =>
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

export const InitialUnauthenticatedTableRef: Table.UnauthenticatedTableRefObj<any> = {
  getCSVData: (fields?: string[]) => [],
  changeColumnVisibility: (changes: SingleOrArray<Table.ColumnVisibilityChange<any>>, sizeToFit?: boolean) => {}
};

export const InitialAuthenticatedTableRef: Table.AuthenticatedTableRefObj<any> = {
  applyTableChange: (event: Table.ChangeEvent<any>) => {},
  applyGroupColorChange: (group: Model.Group) => {},
  ...InitialUnauthenticatedTableRef
};

export const useUnauthenticatedTable = <R extends Table.RowData>(): NonNullRef<Table.UnauthenticatedTableRefObj<R>> => {
  return useRef<Table.UnauthenticatedTableRefObj<R>>(InitialUnauthenticatedTableRef);
};

/* eslint-disable indent */
export const useUnauthenticatedTableIfNotDefined = <R extends Table.RowData>(
  grid?: NonNullRef<Table.UnauthenticatedTableRefObj<R>>
): NonNullRef<Table.UnauthenticatedTableRefObj<R>> =>
  hooks.useRefIfNotDefined<Table.UnauthenticatedTableRefObj<R>>(useUnauthenticatedTable, grid);

export const useAuthenticatedTable = <R extends Table.RowData>(): NonNullRef<Table.AuthenticatedTableRefObj<R>> => {
  return useRef<Table.AuthenticatedTableRefObj<R>>(InitialAuthenticatedTableRef);
};

export const useAuthenticatedTableIfNotDefined = <R extends Table.RowData>(
  grid?: NonNullRef<Table.AuthenticatedTableRefObj<R>>
): NonNullRef<Table.AuthenticatedTableRefObj<R>> =>
  hooks.useRefIfNotDefined<Table.AuthenticatedTableRefObj<R>>(useAuthenticatedTable, grid);
