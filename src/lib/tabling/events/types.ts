import { SyntheticEvent } from "react";

import { store, api } from "application";

import * as model from "../../model";
import { enumeratedLiterals, EnumeratedLiteralType, SingleOrArray } from "../../util";
import * as columns from "../columns";
import * as rows from "../rows";
import * as types from "../types";

export type CellDoneEditingEvent = SyntheticEvent | KeyboardEvent;

export type KeyListener<R extends rows.Row> = (
  localApi: types.GridApi<R>,
  e: KeyboardEvent,
) => void;

export const EventForms = enumeratedLiterals(["change", "control", "meta"] as const);

export type EventForm = EnumeratedLiteralType<typeof EventForms>;

export type EventFormFromId<T extends TableEventId> = T extends ControlEventId
  ? "control"
  : T extends ChangeEventId
  ? "change"
  : T extends MetaEventId
  ? "meta"
  : never;

/**
 * Control events are table events that are dispatched from the code in response to other actions,
 * but they are not derived solely from a user's interaction with the table.
 */
export const ControlEventIds = enumeratedLiterals([
  "modelsUpdated",
  "updateRows",
  "modelsAdded",
  "placeholdersActivated",
] as const);

export type ControlEventId = EnumeratedLiteralType<typeof ControlEventIds>;

/**
 * Change events are table events that are derived solely from a user's interaction with a table.
 * Unlike control events, change events are reversible.
 */
export const TraversibleEventIds = enumeratedLiterals(["dataChange"] as const);

/**
 * Subset of ChangeEvent(s) that support undo/redo.
 */
export type TraversibleEventId = EnumeratedLiteralType<typeof TraversibleEventIds>;

/**
 * Change events are table events that are derived solely from a user's interaction with a table.
 * Unlike control events, change events are reversible.
 */
export const ChangeEventIds = enumeratedLiterals([
  ...TraversibleEventIds.__ALL__,
  "rowAddData",
  "rowAddIndex",
  "rowAddCount",
  "groupAdd",
  "groupUpdate",
  "markupAdd",
  "markupUpdate",
  "rowInsert",
  "rowPositionChanged",
  "rowDelete",
  "rowRemoveFromGroup",
  "rowAddToGroup",
] as const);

export type ChangeEventId = EnumeratedLiteralType<typeof ChangeEventIds>;

/**
 * Meta events are table events that are derived solely from a user's interaction with a table but
 * operate on events themselves.
 */
export const MetaEventIds = enumeratedLiterals(["forward", "reverse"] as const);
export type MetaEventId = EnumeratedLiteralType<typeof MetaEventIds>;

export const TableEventIds = enumeratedLiterals([
  ...ChangeEventIds.__ALL__,
  ...ControlEventIds.__ALL__,
  ...MetaEventIds.__ALL__,
] as const);
export type TableEventId = EnumeratedLiteralType<typeof TableEventIds>;

export type CellChange<
  R extends rows.Row,
  K extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
> = {
  readonly oldValue: types.CellValue<R, K>;
  readonly newValue: types.CellValue<R, K>;
};

export type SoloCellChange<
  R extends rows.Row,
  K extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
> = CellChange<R, K> & {
  readonly field: K;
  readonly id: rows.RowSubType<R, rows.EditableRowType>["id"];
};

export type RowChangeData<R extends rows.Row> = Partial<{
  [key in columns.ColumnFieldName<R>]: CellChange<R, key>;
}>;

export type RowChange<
  R extends rows.Row,
  ID extends rows.RowSubType<R, rows.EditableRowType>["id"] = rows.RowSubType<
    R,
    rows.EditableRowType
  >["id"],
> = {
  readonly id: ID;
  readonly data: RowChangeData<R>;
};

export type RowAddCountPayload = {
  readonly count: number;
  /* Placeholder IDs must be provided ahead of time so that the IDs are consistent between the sagas
     and the reducer. */
  readonly placeholderIds: rows.PlaceholderRowId[];
};

export type RowAddIndexPayload = {
  readonly newIndex: number;
  readonly count?: number;
  /* Placeholder IDs must be provided ahead of time so that the IDs are consistent between the sagas
     and the reducer. */
  readonly placeholderIds: rows.PlaceholderRowId[];
};

export type RowAddDataPayload<R extends rows.Row = rows.Row> = {
  readonly data: rows.RowData<R>[];
  /* Placeholder IDs must be provided ahead of time so that the IDs are consistent between the sagas
     and the reducer. */
  readonly placeholderIds: rows.PlaceholderRowId[];
};

export type ChangeEventPayload<
  T extends ChangeEventId = ChangeEventId,
  R extends rows.Row = rows.Row,
> = T extends ChangeEventId
  ? {
      readonly dataChange: SingleOrArray<RowChange<R>>;
      readonly rowInsert: {
        readonly previous: number;
        readonly data: rows.RowData<R>;
        readonly group: rows.RowId<"group"> | null;
      };
      readonly rowPositionChanged: {
        readonly previous: number | null;
        readonly newGroup: rows.RowId<"group"> | null;
        readonly id: rows.RowId<"model">;
      };
      readonly rowDelete: {
        readonly rows: SingleOrArray<rows.RowId<"body">>;
      };
      readonly rowAddData: RowAddDataPayload<R>;
      readonly rowAddIndex: RowAddIndexPayload;
      readonly rowAddCount: RowAddCountPayload;
      readonly groupAdd: api.GroupPayload;
      readonly markupAdd: api.MarkupPayload;
      readonly rowUpdate: {
        readonly rows: SingleOrArray<rows.RowId<"model">>;
      };
      readonly markupUpdate: store.HttpUpdateModelPayload<model.Markup, api.MarkupPayload>;
      readonly groupUpdate: store.HttpUpdateModelPayload<model.Group, api.GroupPayload>;
      readonly rowAddToGroup: {
        readonly group: rows.RowId<"group">;
        readonly rows: SingleOrArray<rows.RowId<"model">>;
      };
      readonly rowRemoveFromGroup: {
        readonly rows: SingleOrArray<rows.RowId<"model">>;
        readonly group: rows.RowId<"group">;
      };
    }[T]
  : never;

export type ModelTableEventPayload<M extends model.RowTypedApiModel = model.RowTypedApiModel> = {
  readonly model: M;
  readonly group?: number | null;
};

export type ControlEventPayload<
  T extends ControlEventId = ControlEventId,
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = T extends ControlEventId
  ? {
      readonly modelsUpdated: SingleOrArray<ModelTableEventPayload<M> | model.Group | model.Markup>;
      readonly updateRows: {
        readonly data: Partial<rows.RowSubType<R, rows.EditableRowType>["data"]>;
        readonly id: rows.RowId<"model">;
      };
      readonly modelsAdded: SingleOrArray<ModelTableEventPayload<M> | model.Group | model.Markup>;
      readonly placeholdersActivated: {
        readonly placeholderIds: rows.RowId<"placeholder">[];
        readonly models: M[];
      };
    }[T]
  : never;

export type MetaEventPayload<T extends MetaEventId = MetaEventId> = T extends MetaEventId
  ? {
      readonly reverse: null;
      readonly forward: null;
    }[T]
  : never;

export type TableEventPayload<
  T extends TableEventId = TableEventId,
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = T extends MetaEventId
  ? MetaEventPayload<T>
  : T extends ControlEventId
  ? ControlEventPayload<T, R, M>
  : T extends ChangeEventId
  ? ChangeEventPayload<T, R>
  : never;

type BaseTableEvent<
  T extends TableEventId = TableEventId,
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = T extends TableEventId
  ? {
      readonly type: T;
      readonly payload: TableEventPayload<T, R, M>;
      readonly meta?: "forward" | "reverse";
    }
  : never;

type _ChangeEvent<
  T extends ChangeEventId = ChangeEventId,
  R extends rows.Row = rows.Row,
> = BaseTableEvent<T, R> & {
  readonly onSuccess?: <V>(v: V) => void;
  readonly onError?: (e: Error) => void;
};

type _ControlEvent<
  T extends ControlEventId = ControlEventId,
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = BaseTableEvent<T, R, M>;

type _MetaEvent<
  T extends MetaEventId = MetaEventId,
  R extends rows.Row = rows.Row,
> = BaseTableEvent<T, R>;

type _TableEvent<
  T extends TableEventId = TableEventId,
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = T extends TableEventId
  ? {
      change: T extends ChangeEventId ? _ChangeEvent<T, R> : never;
      control: T extends ControlEventId ? _ControlEvent<T, R, M> : never;
      meta: T extends MetaEventId ? _MetaEvent<T, R> : never;
    }[EventFormFromId<T>]
  : never;

export type TableEvent<
  T extends TableEventId = TableEventId,
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = T extends TableEventId ? _TableEvent<T, R, M> : never;

export type AnyTableEvent<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = _TableEvent<TableEventId, R, M>;

// Events for which undo/redo is supported.  The events must be ChangeEvents.
export type TraversibleEvent<
  T extends TraversibleEventId = TraversibleEventId,
  R extends rows.Row = rows.Row,
> = T extends TraversibleEventId ? _TableEvent<T, R> : never;

export type AnyTraversibleEvent<R extends rows.Row = rows.Row> = TraversibleEvent<
  TraversibleEventId,
  R
>;

export type ChangeEvent<
  T extends ChangeEventId = ChangeEventId,
  R extends rows.Row = rows.Row,
> = T extends ChangeEventId ? _TableEvent<T, R> : never;

export type AnyChangeEvent<R extends rows.Row = rows.Row> = ChangeEvent<ChangeEventId, R>;

export type RowAddEventId = "rowAddIndex" | "rowAddData" | "rowAddCount";
export type RowAddEvent<
  R extends rows.Row = rows.Row,
  T extends RowAddEventId = RowAddEventId,
> = T extends RowAddEventId ? ChangeEvent<T, R> : never;

export type MetaEvent<T extends MetaEventId> = T extends MetaEventId ? _TableEvent<T> : never;

export type AnyMetaEvent = MetaEvent<MetaEventId>;

export type ControlEvent<
  T extends ControlEventId,
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = T extends ControlEventId ? _TableEvent<T, R, M> : never;

export type AnyControlEvent<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = ControlEvent<ControlEventId, R, M>;

export type ChangeEventHistory<R extends rows.Row = rows.Row> = TraversibleEvent<
  TraversibleEventId,
  R
>[];
