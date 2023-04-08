import { isNil, reduce, filter } from "lodash";

import { tabling, redux, util } from "lib";

const createPlaceholdersActivatedEventReducer = <
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Redux.ActionContext = Redux.ActionContext,
>(
  config: Table.AuthenticatedReducerConfig<R, M, S, C>,
): Redux.BasicReducer<S, Table.PlaceholdersActivatedEvent<M>> => {
  const modelRowManager = new tabling.rows.ModelRowManager<R, M>({
    getRowChildren: config.getModelRowChildren,
    columns: config.columns,
  });
  return (s: S = config.initialState, e: Table.PlaceholdersActivatedEvent<M>): S =>
    reduce(
      e.payload.placeholderIds,
      (st: S, id: Table.PlaceholderRowId, index: number) => {
        const r: Table.PlaceholderRow<R> | null = redux.findModelInData<Table.PlaceholderRow<R>>(
          filter(st.data, (ri: Table.BodyRow<R>) =>
            tabling.rows.isPlaceholderRow(ri),
          ) as Table.PlaceholderRow<R>[],
          id,
        );
        if (!isNil(r)) {
          return {
            ...st,
            data: util.replaceInArray<Table.BodyRow<R>>(
              st.data,
              { id: r.id },
              modelRowManager.create({ model: e.payload.models[index] }),
            ),
          };
        }
        return st;
      },
      s,
    );
};

export default createPlaceholdersActivatedEventReducer;
