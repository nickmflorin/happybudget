import { useEffect, useMemo, useReducer } from "react";
import { isNil, filter, map, reduce, find } from "lodash";

import { tabling } from "lib";

type UseHiddenColumnsParams<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
  readonly tableId: string;
  readonly columns: Table.DataColumn<R, M>[];
  readonly apis: tabling.TableApis;
};

type UseHiddenColumnsReturnType = [
  Table.HiddenColumns,
  (changes: SingleOrArray<Table.ColumnVisibilityChange>, sizeToFit?: boolean) => void
];

type SetHiddenColumnsAction = Omit<Redux.Action<Table.HiddenColumns>, "context"> & {
  readonly type: "SET";
  readonly cookie?: string | undefined;
};

type ChangeHiddenColumnsAction = Omit<Redux.Action<SingleOrArray<Table.ColumnVisibilityChange>>, "context"> & {
  readonly type: "TOGGLE";
  readonly tableId: string;
};

type HiddenColumnsAction = SetHiddenColumnsAction | ChangeHiddenColumnsAction;

const hiddenColumnsReducer = (state: Table.HiddenColumns = {}, action: HiddenColumnsAction): Table.HiddenColumns => {
  if (action.type === "SET") {
    if (!isNil(action.cookie)) {
      tabling.cookies.setHiddenColumns(action.cookie, action.payload);
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
    tabling.cookies.setHiddenColumns(action.tableId, newState);
    return newState;
  }
};

const useHiddenColumns = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  params: UseHiddenColumnsParams<R, M>
): UseHiddenColumnsReturnType => {
  const [hiddenColumns, dispatch] = useReducer(hiddenColumnsReducer, {});

  useEffect(() => {
    let hiddenColumnsInCookies: Table.HiddenColumns = {};
    hiddenColumnsInCookies = tabling.cookies.getHiddenColumns(
      params.tableId,
      filter(
        map(
          filter(params.columns, (c: Table.DataColumn<R, M>) => c.canBeHidden !== false),
          (c: Table.DataColumn<R, M>) => c.field
        ),
        (f: string | undefined) => !isNil(f)
      )
    );
    const hidden: Table.HiddenColumns = reduce(
      params.columns,
      (curr: Table.HiddenColumns, c: Table.DataColumn<R, M>) => {
        if (c.canBeHidden !== false) {
          const field = tabling.columns.normalizedField<R, M>(c);
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
    dispatch({ type: "SET", cookie: params.tableId, payload: hidden });
  }, [params.tableId]);

  useEffect(() => {
    const api = params.apis.get("data");
    if (!isNil(api)) {
      const fields = Object.keys(hiddenColumns);
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const hidden = hiddenColumns[field];

        const cs: Table.AgColumn[] | null = api.column.getAllColumns();
        if (!isNil(cs)) {
          const c: Table.AgColumn | undefined = find(cs, (ci: Table.AgColumn) => ci.getColId() === field);
          if (!isNil(c) && c.isVisible() === hidden) {
            params.apis.columnMap((a: Table.ColumnApi) => a.setColumnVisible(field, !hidden));
          }
        }
      }
      params.apis.gridMap((a: Table.GridApi) => a.sizeColumnsToFit());
    }
  }, [hiddenColumns, params.apis]);

  const changeColumnVisibility = useMemo(
    () => (changes: SingleOrArray<Table.ColumnVisibilityChange>) => {
      dispatch({ type: "TOGGLE", tableId: params.tableId, payload: changes });
    },
    [params.tableId]
  );

  return [hiddenColumns, changeColumnVisibility];
};

export default useHiddenColumns;
