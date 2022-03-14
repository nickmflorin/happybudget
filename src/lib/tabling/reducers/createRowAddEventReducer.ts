import { reduce, filter } from "lodash";

import * as columns from "../columns";
import * as events from "../events";
import * as rows from "../rows";
import { reorderRows } from "./util";

const createRowAddEventReducer = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Table.Context = Table.Context,
  A extends Redux.AuthenticatedTableActionMap<R, M, C> = Redux.AuthenticatedTableActionMap<R, M, C>
>(
  config: Omit<Table.ReducerConfig<R, M, S, C, A>, "defaultDataOnUpdate">
): Redux.Reducer<S, Table.RowAddEvent<R>> => {
  const placeholderRowManager = new rows.PlaceholderRowManager<R, M>({
    columns: config.columns,
    defaultData: config.defaultDataOnCreate
  });
  return (s: S = config.initialState, e: Table.RowAddEvent<R>) => {
    const p: Table.RowAddPayload<R> = e.payload;
    let d: Partial<R>[];
    if (events.isRowAddCountPayload(p) || events.isRowAddIndexPayload(p)) {
      d = rows.generateNewRowData(
        { store: s.data, ...p },
        filter(config.columns, (c: Table.DataColumn<R, M>) => columns.isBodyColumn(c)) as Table.BodyColumn<R, M>[]
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
