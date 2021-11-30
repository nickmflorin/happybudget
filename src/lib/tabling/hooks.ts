import { useEffect, useRef, useMemo, useReducer } from "react";
import { isNil, filter, map, reduce, find } from "lodash";

import { ColumnApi, GridApi } from "@ag-grid-community/core";

import * as hooks from "../hooks";
import TableApis from "./apis";
import * as cookies from "./cookies";
import * as columns from "./columns";

type UseHiddenColumnsParams<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
  readonly cookie?: string;
  readonly columns: Table.Column<R, M>[];
  readonly apis: TableApis;
};

type UseHiddenColumnsReturnType = [
  Table.HiddenColumns,
  (changes: SingleOrArray<Table.ColumnVisibilityChange>, sizeToFit?: boolean) => void
];

type SetHiddenColumnsAction = Redux.Action<Table.HiddenColumns, "SET"> & {
  readonly cookie?: string | undefined;
};
type ChangeHiddenColumnsAction = Redux.Action<SingleOrArray<Table.ColumnVisibilityChange>, "TOGGLE"> & {
  readonly cookie?: string | undefined;
};
type HiddenColumnsAction = SetHiddenColumnsAction | ChangeHiddenColumnsAction;

/* eslint-disable indent */
const hiddenColumnsReducer = (state: Table.HiddenColumns = {}, action: HiddenColumnsAction): Table.HiddenColumns => {
  if (action.type === "SET") {
    if (!isNil(action.cookie)) {
      cookies.setHiddenColumns(action.cookie, action.payload);
    }
    return action.payload;
  } else {
    const arrayOfChanges = Array.isArray(action.payload) ? action.payload : [action.payload];
    const newState: Table.HiddenColumns = reduce(
      arrayOfChanges,
      (curr: Table.HiddenColumns, ch: Table.ColumnVisibilityChange) => {
        return { ...curr, [ch.field]: !ch.visible };
      },
      state
    );
    if (!isNil(action.cookie)) {
      cookies.setHiddenColumns(action.cookie, newState);
    }
    return newState;
  }
};

export const useHiddenColumns = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  params: UseHiddenColumnsParams<R, M>
): UseHiddenColumnsReturnType => {
  const [hiddenColumns, dispatch] = useReducer(hiddenColumnsReducer, {});

  useEffect(() => {
    let hiddenColumnsInCookies: Table.HiddenColumns = {};
    if (!isNil(params.cookie)) {
      hiddenColumnsInCookies = cookies.getHiddenColumns(
        params.cookie,
        filter(
          map(
            filter(params.columns, (c: Table.Column<R, M>) => c.canBeHidden !== false),
            (c: Table.Column<R, M>) => c.field || c.colId
          ),
          (f: string | undefined) => !isNil(f)
        ) as string[]
      );
    }
    let hidden: Table.HiddenColumns = reduce(
      params.columns,
      (curr: Table.HiddenColumns, c: Table.Column<R, M>) => {
        if (c.canBeHidden !== false) {
          const field = columns.normalizedField<R, M>(c);
          if (!isNil(field)) {
            const defaultHidden = c.defaultHidden === undefined ? false : c.defaultHidden;
            const cookiesVisibility = hiddenColumnsInCookies[field];
            return { ...curr, [field]: cookiesVisibility !== undefined ? cookiesVisibility : defaultHidden };
          }
        }
        return curr;
      },
      {}
    );
    dispatch({ type: "SET", cookie: params.cookie, payload: hidden });
  }, [params.cookie]);

  useEffect(() => {
    const api = params.apis.get("data");
    if (!isNil(api)) {
      const fields = Object.keys(hiddenColumns);
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const hidden = hiddenColumns[field];

        const cs: Table.AgColumn[] | null = api.column.getAllColumns();
        if (!isNil(cs)) {
          /* eslint-disable no-loop-func */
          const c: Table.AgColumn | undefined = find(cs, (ci: Table.AgColumn) => ci.getColId() === field);
          if (!isNil(c)) {
            if (c.isVisible() === hidden) {
              params.apis.columnMap((a: ColumnApi) => a.setColumnVisible(field as string, !hidden));
            }
          }
        }
      }
      params.apis.gridMap((a: GridApi) => a.sizeColumnsToFit());
    }
  }, [hiddenColumns, params.apis]);

  const changeColumnVisibility = useMemo(
    () => (changes: SingleOrArray<Table.ColumnVisibilityChange>) => {
      dispatch({ type: "TOGGLE", cookie: params.cookie, payload: changes });
    },
    [params.cookie]
  );

  return [hiddenColumns, changeColumnVisibility];
};

export const InitialGridRef: Table.DataGridInstance = {
  getCSVData: (fields?: string[]) => []
};

export const useDataGrid = (): NonNullRef<Table.DataGridInstance> => {
  return useRef<Table.DataGridInstance>(InitialGridRef);
};

export const InitialTableRef: Table.TableInstance<any, any> = {
  ...InitialGridRef,
  getFocusedRow: () => null,
  getRow: () => null,
  getRows: () => [],
  getRowsAboveAndIncludingFocusedRow: () => [],
  changeColumnVisibility: (changes: SingleOrArray<Table.ColumnVisibilityChange>) => {},
  applyTableChange: (event: SingleOrArray<Table.ChangeEvent<any>>) => {}
};

export const useTable = <
  R extends Table.RowData = object,
  M extends Model.RowHttpModel = Model.RowHttpModel
>(): NonNullRef<Table.TableInstance<R, M>> => {
  return useRef<Table.TableInstance<R, M>>(InitialTableRef);
};

/* eslint-disable indent */
export const useTableIfNotDefined = <
  R extends Table.RowData = object,
  M extends Model.RowHttpModel = Model.RowHttpModel
>(
  table?: NonNullRef<Table.TableInstance<R, M>>
): NonNullRef<Table.TableInstance<R, M>> => hooks.useRefIfNotDefined<Table.TableInstance<R, M>>(useTable, table);
