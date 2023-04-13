import { store } from "application";
import { logger } from "internal";

import * as columns from "../columns";
import * as rows from "../rows";

import * as typeguards from "./typeguards";
import * as types from "./types";
import * as util from "./util";

type EventTraverseConfig<
  T extends types.TraversibleEventId = types.TraversibleEventId,
  R extends rows.Row = rows.Row,
  RE extends types.AnyChangeEvent<R> = types.AnyChangeEvent<R>,
> = {
  readonly typeguard: (e: types.AnyChangeEvent<R>) => e is types.TraversibleEvent<T, R>;
  readonly conditional?: (e: types.TraversibleEvent<T, R>) => boolean;
  readonly reverse: (e: types.TraversibleEvent<T, R>) => RE | null;
};

const reverseRowChange = <R extends rows.Row, N extends columns.ColumnFieldName<R>>(
  rowChange: types.RowChange<R, N>,
): types.RowChange<R> => {
  const newData: types.RowChangeData<R> = Object.keys(rowChange.data).reduce(
    (prev: types.RowChangeData<R>, key: string): types.RowChangeData<R> => {
      const value = rowChange.data[key as N];
      if (value !== undefined) {
        return { ...prev, [key as N]: { oldValue: value.newValue, newValue: value.oldValue } };
      }
      return prev;
    },
    {} as types.RowChangeData<R>,
  );
  return { id: rowChange.id, data: newData };
};

const getTraverseConfigs = <R extends rows.Row>(): [
  EventTraverseConfig<"dataChange", R, types.ChangeEvent<"dataChange", R>>,
] => [
  {
    typeguard: typeguards.createTableEventTypeGuard("dataChange"),
    reverse: <R extends rows.Row = rows.Row>(
      e: types.ChangeEvent<"dataChange", R>,
    ): types.ChangeEvent<"dataChange", R> => {
      /* We only are interested in the first row change for now, since the conditional ensures
           there is only one row change at a time. */
      let rowChanges = Array.isArray(e.payload) ? e.payload : [e.payload];
      rowChanges = util.consolidateRowChanges(rowChanges);
      return {
        ...e,
        payload: rowChanges.map((rch: types.RowChange<R>) => reverseRowChange(rch)),
      };
    },
  },
];

type GetTraverseConfigRT<R extends rows.Row, O extends { readonly strict?: true }> = O extends {
  readonly strict: true;
}
  ? EventTraverseConfig<types.TraversibleEventId, R>
  : EventTraverseConfig<types.TraversibleEventId, R> | null;

const getTraverseConfig = <R extends rows.Row, O extends { readonly strict?: true }>(
  e: types.AnyChangeEvent<R>,
  options?: O,
): GetTraverseConfigRT<R, O> => {
  const configs = getTraverseConfigs<R>();
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    if (config.typeguard(e)) {
      return config;
    }
  }
  if (options?.strict === true) {
    throw new Error(`No event traverse configuration defined for event ${e.type}.`);
  }
  return null as GetTraverseConfigRT<R, O>;
};

export const eventCanTraverse = <R extends rows.Row>(e: types.AnyChangeEvent<R>): boolean => {
  if (!typeguards.isTraversibleEvent(e)) {
    return false;
  }
  const config = getTraverseConfig(e, { strict: true });
  if (config.conditional !== undefined) {
    return config.conditional(e);
  }
  /* If there is a EventTreverseConfig defined for the event but there is no conditional, the event
     can traverse. */
  return true;
};

export const reverseChangeEvent = <R extends rows.Row, T extends types.TraversibleEventId>(
  e: types.TraversibleEvent<T, R>,
): types.AnyChangeEvent<R> | null => {
  if (!eventCanTraverse<R>(e)) {
    return null;
  }
  const config = getTraverseConfig(e, { strict: true });
  const evt = config.reverse(e);
  return evt !== null ? { ...evt, meta: "reverse" } : null;
};

export const getRedoEvent = <
  R extends rows.Row,
  S extends store.TableStore<R> = store.TableStore<R>,
>(
  store: S,
): types.AnyChangeEvent<R> | null => {
  const nextEvent = store.eventHistory[store.eventIndex + 1];
  if (nextEvent === undefined) {
    return null;
  }
  return { ...nextEvent, meta: "forward" };
};

export const getUndoEvent = <
  R extends rows.Row,
  S extends store.TableStore<R> = store.TableStore<R>,
>(
  store: S,
): types.AnyChangeEvent<R> | null => {
  if (store.eventIndex === -1) {
    return null;
  }
  const lastEvent = store.eventHistory[store.eventIndex];
  if (lastEvent === undefined) {
    logger.warn(
      { eventIndex: store.eventIndex, historyLength: store.eventHistory.length },
      "Suspicious behavior: Undo event cannot be returned as there are no event at event index " +
        `${store.eventIndex} (length of event history is ${store.eventHistory.length}).`,
    );
    return null;
  }
  return reverseChangeEvent(lastEvent);
};
