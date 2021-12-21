import { useEffect, useMemo, useReducer } from "react";
import { isNil, filter, map, reduce, find } from "lodash";

import { tabling } from "lib";

type UseHiddenColumnsParams<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
  readonly cookie?: string;
  readonly columns: Table.DataColumn<R, M>[];
  readonly apis: tabling.TableApis;
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
    if (!isNil(action.cookie)) {
      tabling.cookies.setHiddenColumns(action.cookie, newState);
    }
    return newState;
  }
};

const useHiddenColumns = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  params: UseHiddenColumnsParams<R, M>
): UseHiddenColumnsReturnType => {
  const [hiddenColumns, dispatch] = useReducer(hiddenColumnsReducer, {});

  useEffect(() => {
    let hiddenColumnsInCookies: Table.HiddenColumns = {};
    if (!isNil(params.cookie)) {
      hiddenColumnsInCookies = tabling.cookies.getHiddenColumns(
        params.cookie,
        filter(
          map(
            filter(params.columns, (c: Table.DataColumn<R, M>) => c.canBeHidden !== false),
            (c: Table.DataColumn<R, M>) => c.field
          ),
          (f: string | undefined) => !isNil(f)
        ) as string[]
      );
    }
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
          if (!isNil(c) && c.isVisible() === hidden) {
            params.apis.columnMap((a: Table.ColumnApi) => a.setColumnVisible(field as string, !hidden));
          }
        }
      }
      params.apis.gridMap((a: Table.GridApi) => a.sizeColumnsToFit());
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

export default useHiddenColumns;
