import { isNil, map, reduce } from "lodash";

import * as typeguards from "./typeguards";
import * as util from "./util";

type InferR<E> = E extends Table.TraversibleEvent<infer R> ? R : never;
type InferRW<R extends Table.RowData, E> = E extends Table.TraversibleEvent<R, infer RW>
  ? RW
  : never;

type EventTraverseConfig<
  E extends Table.TraversibleEvent = Table.TraversibleEvent,
  TE extends Table.ChangeEvent<InferR<E>, InferRW<InferR<E>, E>> = Table.ChangeEvent<
    InferR<E>,
    InferRW<InferR<E>, E>
  >,
  RE extends Table.ChangeEvent<InferR<E>, InferRW<InferR<E>, E>> = Table.ChangeEvent<
    InferR<E>,
    InferRW<InferR<E>, E>
  >,
> = {
  readonly typeguard: (e: Table.ChangeEvent<InferR<E>, InferRW<InferR<E>, E>>) => e is TE;
  readonly conditional?: (e: E) => boolean;
  readonly reverse: (e: E) => RE | null;
};

const reverseRowChange = <
  R extends Table.RowData = Table.RowData,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>,
>(
  rowChange: Table.RowChange<R, RW>,
): Table.RowChange<R, RW> => {
  type D = typeof rowChange["data"];
  const newData: D = reduce(
    rowChange.data,
    (prev: D, curr: D[keyof D], key: string) =>
      !isNil(curr)
        ? { ...prev, [key as keyof D]: { oldValue: curr.newValue, newValue: curr.oldValue } }
        : prev,
    {},
  );
  return { id: rowChange.id, data: newData };
};

const EventTraverseConfigs: [EventTraverseConfig<Table.DataChangeEvent>] = [
  {
    typeguard: typeguards.isDataChangeEvent,
    reverse: <
      Ri extends Table.RowData = Table.RowData,
      RWi extends Table.EditableRow<Ri> = Table.EditableRow<Ri>,
    >(
      e: Table.DataChangeEvent<Ri, RWi>,
    ): Table.DataChangeEvent<Ri, RWi> => {
      /* We only are interested in the first row change for now, since the
         conditional ensures there is only one row change at a time. */
      let rowChanges = Array.isArray(e.payload) ? e.payload : [e.payload];
      rowChanges = util.consolidateRowChanges(rowChanges);
      return {
        ...e,
        payload: map(rowChanges, (rch: Table.RowChange<Ri, RWi>) => reverseRowChange(rch)),
      };
    },
  },
];

const getTraverseConfig = <
  R extends Table.RowData,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>,
>(
  e: Table.ChangeEvent<R, RW>,
  strict = false,
): EventTraverseConfig | null => {
  for (let i = 0; i < EventTraverseConfigs.length; i++) {
    const config = EventTraverseConfigs[i];
    if (config.typeguard(e)) {
      return config;
    }
  }
  if (strict) {
    throw new Error(`No event traverse configuration defined for event ${e.type}.`);
  }
  return null;
};

export const eventCanTraverse = <
  R extends Table.RowData,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>,
>(
  e: Table.ChangeEvent<R, RW>,
): boolean => {
  if (!typeguards.isTraversibleEvent(e)) {
    return false;
  }
  const config = getTraverseConfig(e, true) as EventTraverseConfig;
  if (!isNil(config.conditional)) {
    return config.conditional(e);
  }
  /* If there is a EventTreverseConfig defined for the event but there is no
		 conditional, the event can traverse. */
  return true;
};

export const reverseChangeEvent = <E extends Table.TraversibleEvent = Table.TraversibleEvent>(
  e: E,
): Table.ChangeEvent<InferR<E>, InferRW<InferR<E>, E>> | null => {
  if (!eventCanTraverse(e)) {
    return null;
  }
  const config = getTraverseConfig(e, true) as EventTraverseConfig<E>;
  const evt = config.reverse(e);
  return !isNil(evt) ? { ...evt, meta: "reverse" } : null;
};

export const getRedoEvent = <
  R extends Table.RowData,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
>(
  store: S,
): Table.ChangeEvent<R, Table.EditableRow<R>> | null => {
  const nextEvent = store.eventHistory[store.eventIndex + 1];
  if (isNil(nextEvent)) {
    return null;
  }
  return { ...nextEvent, meta: "forward" };
};

export const getUndoEvent = <
  R extends Table.RowData,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
>(
  store: S,
): Table.ChangeEvent<R, Table.EditableRow<R>> | null => {
  if (store.eventIndex === -1) {
    return null;
  }
  const lastEvent = store.eventHistory[store.eventIndex];
  if (isNil(lastEvent)) {
    console.warn(
      "Suspicious behavior: Undo event cannot be returned as there are no " +
        `event at event index ${store.eventIndex} (length of event history ` +
        `is ${store.eventHistory.length}).`,
    );
    return null;
  }
  return reverseChangeEvent(lastEvent);
};
