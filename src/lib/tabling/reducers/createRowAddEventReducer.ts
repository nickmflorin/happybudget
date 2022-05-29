import { reduce, filter } from "lodash";

import { tabling } from "lib";
import { reorderRows } from "./util";

const createRowAddEventReducer = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Redux.ActionContext = Redux.ActionContext
>(
  config: Omit<Table.AuthenticatedReducerConfig<R, M, S, C>, "defaultDataOnUpdate">
): Redux.BasicReducer<S, Table.RowAddEvent<R>> => {
  const placeholderRowManager = new tabling.rows.PlaceholderRowManager<R, M>({
    columns: config.columns,
    defaultData: config.defaultDataOnCreate
  });
  return (s: S = config.initialState, e: Table.RowAddEvent<R>) => {
    const p: Table.RowAddPayload<R> = e.payload;
    let d: Partial<R>[];
    if (tabling.events.isRowAddCountPayload(p) || tabling.events.isRowAddIndexPayload(p)) {
      d = tabling.rows.generateNewRowData(
        { store: s.data, ...p },
        filter(config.columns, (c: Table.DataColumn<R, M>) => tabling.columns.isBodyColumn(c)) as Table.BodyColumn<
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
