import { SyntheticEvent } from "react";

import { enumeratedLiterals, EnumeratedLiteralType } from "../../util";

import * as columns from "./columns";
import * as framework from "./framework";
import * as rows from "./rows";

export type CellDoneEditingEvent = SyntheticEvent | KeyboardEvent;

export type KeyListener<R extends rows.Row> = (
  localApi: framework.GridApi<R>,
  e: KeyboardEvent,
) => void;

export const EventForms = enumeratedLiterals(["change", "control", "meta"] as const);

export type EventForm = EnumeratedLiteralType<typeof EventForms>;

export type EventFormFromId<T extends EventId> = T extends ControlEventId
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
  "rowAdd",
  "groupAdd",
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

export const EventIds = enumeratedLiterals([
  ...ChangeEventIds.__ALL__,
  ...ControlEventIds.__ALL__,
  ...MetaEventIds.__ALL__,
] as const);
export type EventId = EnumeratedLiteralType<typeof EventIds>;

export type CellChangeValue<
  R extends rows.Row<rows.EditableRowType>,
  K extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
> = rows.RowData<R>[K];

export type CellChange<
  R extends rows.Row<rows.EditableRowType>,
  K extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
> = {
  readonly oldValue: CellChangeValue<R, K>;
  readonly newValue: CellChangeValue<R, K>;
};

export type SoloCellChange<
  R extends rows.Row<rows.EditableRowType>,
  K extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
> = CellChange<R, K> & {
  readonly field: K;
  readonly id: R["id"];
};

export type RowChangeData<R extends rows.Row<rows.EditableRowType>> = {
  [key in columns.ColumnFieldName<R>]?: CellChange<R, key>;
};

export type RowChange<R extends rows.Row<rows.EditableRowType>> = {
  readonly id: R["id"];
  readonly data: RowChangeData<R>;
};

export type RowAddCountPayload = { readonly count: number };
export type RowAddIndexPayload = { readonly newIndex: number; readonly count?: number };
export type RowAddDataPayload<R extends rows.RowData> = Partial<R>[];
export type RowAddPayload<R extends rows.RowData> =
  | RowAddCountPayload
  | RowAddIndexPayload
  | RowAddDataPayload<R>;

type EventArg<T extends EventId = EventId> = T extends EventId
  ? {
      readonly modelsUpdated: Model.RowHttpModel;
      readonly updateRows: rows.Row<rows.EditableRowType> | rows.RowData;
      readonly modelsAdded: Model.RowHttpModel;
      readonly placeholdersActivated: Model.RowHttpModel;
      readonly dataChange: rows.Row<rows.EditableRowType> | rows.RowData;
      readonly rowInsert: rows.Row<rows.DataRowType> | rows.RowData;
      readonly rowPositionChanged: never;
      readonly rowDelete: never;
      readonly rowAdd: rows.Row<rows.EditableRowType> | rows.RowData;
      readonly groupAdd: never;
      readonly markupAdd: never;
      readonly rowUpdate: never;
      readonly markupUpdate: never;
      readonly groupUpdate: never;
      readonly rowAddToGroup: never;
      readonly rowRemoveFromGroup: never;
      readonly forward: never;
      readonly reverse: never;
    }[T]
  : never;

export type ChangeEventPayload<
  T extends ChangeEventId = ChangeEventId,
  R extends EventArg<T> = EventArg<T>,
> = T extends ChangeEventId
  ? {
      readonly dataChange: R extends rows.Row<rows.EditableRowType>
        ? SingleOrArray<RowChange<R>>
        : never;
      readonly rowInsert: {
        readonly previous: number;
        readonly data: R extends rows.Row<"model">
          ? Partial<R["data"]>
          : R extends rows.RowData
          ? Partial<R>
          : never;
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
      readonly rowAdd: R extends rows.Row<rows.EditableRowType>
        ? RowAddPayload<R["data"]>
        : R extends rows.RowData
        ? RowAddPayload<R>
        : never;
      readonly groupAdd: Http.GroupPayload;
      readonly markupAdd: Http.MarkupPayload;
      readonly rowUpdate: {
        readonly rows: SingleOrArray<rows.RowId<"model">>;
      };
      readonly markupUpdate: Redux.HttpUpdateModelPayload<Model.Markup, Http.MarkupPayload>;
      readonly groupUpdate: Redux.HttpUpdateModelPayload<Model.Group, Http.GroupPayload>;
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

export type ModelTableEventPayload<M extends Model.RowHttpModel = Model.RowHttpModel> = {
  readonly model: M;
  readonly group?: number | null;
};

export type ControlEventPayload<
  T extends ControlEventId = ControlEventId,
  R extends EventArg<T> = EventArg<T>,
> = T extends ControlEventId
  ? {
      readonly modelsUpdated: R extends Model.RowHttpModel
        ? SingleOrArray<ModelTableEventPayload<R> | Model.Group | Model.Markup>
        : never;
      readonly updateRows: {
        readonly data: R extends rows.Row<rows.EditableRowType>
          ? Partial<R["data"]>
          : R extends Model.RowHttpModel
          ? never
          : R extends rows.RowData
          ? Partial<R>
          : never;
        readonly id: rows.RowId<"model">;
      };
      readonly modelsAdded: R extends Model.RowHttpModel
        ? SingleOrArray<ModelTableEventPayload<R> | Model.Group | Model.Markup>
        : never;
      readonly placeholdersActivated: R extends Model.RowHttpModel
        ? {
            readonly placeholderIds: rows.RowId<"placeholder">[];
            readonly models: R[];
          }
        : never;
    }[T]
  : never;

export type MetaEventPayload<
  T extends MetaEventId = MetaEventId,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  R extends EventArg<T> = EventArg<T>,
> = T extends MetaEventId
  ? {
      readonly reverse: null;
      readonly forward: null;
    }[T]
  : never;

export type TableEventPayload<
  T extends EventId = EventId,
  R extends EventArg<T> = EventArg<T>,
> = T extends MetaEventId
  ? MetaEventPayload<T, R>
  : T extends ControlEventId
  ? ControlEventPayload<T, R>
  : T extends ChangeEventId
  ? ChangeEventPayload<T, R>
  : never;

// export type RowAddDataEvent<R extends EventArg<"rowAdd">> = RowAddDataPayload<R>;

type BaseTableEvent<T extends EventId = EventId, R extends EventArg<T> = EventArg<T>> = {
  readonly type: T;
  readonly payload: TableEventPayload<T, R>;
  readonly meta?: "forward" | "reverse";
};

export type ChangeEvent<
  T extends ChangeEventId = ChangeEventId,
  R extends EventArg<T> = EventArg<T>,
> = BaseTableEvent<T, R> & {
  readonly onSuccess?: <V>(v: V) => void;
  readonly onError?: (e: Error) => void;
};

export type ControlEvent<
  T extends ControlEventId = ControlEventId,
  R extends EventArg<T> = EventArg<T>,
> = BaseTableEvent<T, R>;

export type MetaEvent<
  T extends MetaEventId = MetaEventId,
  R extends EventArg<T> = EventArg<T>,
> = BaseTableEvent<T, R>;

export type TableEvent<T extends EventId = EventId, R extends EventArg<T> = EventArg<T>> = {
  change: T extends ChangeEventId ? ChangeEvent<T, R> : never;
  control: T extends ControlEventId ? ControlEvent<T, R> : never;
  meta: T extends MetaEventId ? MetaEvent<T, R> : never;
}[EventFormFromId<T>];

// Events for which undo/redo is supported.  The events must be ChangeEvents.
export type TraversibleEvent<
  T extends TraversibleEventId = TraversibleEventId,
  R extends EventArg<T> = EventArg<T>,
> = TableEvent<T, R>;

export type ChangeEventHistory<
  R extends EventArg<TraversibleEventId> = EventArg<TraversibleEventId>,
> = TraversibleEvent<TraversibleEventId, R>[];
