import { reduce, filter } from "lodash";

import { tabling } from "lib";

import { reorderRows } from "./util";

const createRowAddEventReducer = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Table.Context = Table.Context,
  A extends Redux.AuthenticatedTableActionMap<R, M, C> = Redux.AuthenticatedTableActionMap<R, M, C>
>(
  config: Table.ReducerConfig<R, M, S, C, A>
): Redux.Reducer<S, Table.RowAddEvent<R>> => {
  const placeholderRowManager = new tabling.managers.PlaceholderRowManager<R, M>({
    columns: config.columns,
    defaultData: config.defaultData
  });
  return (s: S = config.initialState, e: Table.RowAddEvent<R>) => {
    const p: Table.RowAddPayload<R> = e.payload;
    let d: Partial<R>[];
    if (tabling.typeguards.isRowAddCountPayload(p) || tabling.typeguards.isRowAddIndexPayload(p)) {
      d = tabling.patterns.generateNewRowData(
        { store: s.data, ...p },
        filter(config.columns, (c: Table.DataColumn<R, M>) => tabling.typeguards.isBodyColumn(c)) as Table.BodyColumn<
          R,
          M
        >[]
      );
    } else {
      d = p;
    }
    if (e.placeholderIds.length !== d.length) {
      throw new Error(
        `Only ${e.placeholderIds.length} placeholder IDs were provided, but ${d.length}
					new rows are being created.`
      );
    }
    return reorderRows({
      ...s,
      data: reduce(
        d,
        (current: Table.BodyRow<R>[], di: Partial<R>, index: number) => {
          return [
            ...current,
            placeholderRowManager.create({
              id: e.placeholderIds[index],
              data: di
            })
          ];
        },
        s.data
      )
    });
  };
};

export default createRowAddEventReducer;
