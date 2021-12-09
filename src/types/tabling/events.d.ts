/// <reference path="../modeling/models.d.ts" />

declare namespace Table {
  type ChangeEventId =
    | "dataChange"
    | "modelUpdated"
    | "rowAdd"
    | "rowInsert"
    | "modelAdded"
    | "rowPositionChanged"
    | "rowDelete"
    | "rowRemoveFromGroup"
    | "rowAddToGroup"
    | "groupUpdated"
    | "groupAdded"
    | "markupAdded"
    | "markupUpdated";

  type BaseChangeEvent = {
    readonly type: ChangeEventId;
  };

  type CellChange<V = any> = {
    readonly oldValue: V | null;
    readonly newValue: V | null;
  };

  type SoloCellChange<R extends RowData, I extends EditableRowId = EditableRowId, V = any> = CellChange<V> & {
    readonly field: keyof R;
    readonly id: I;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type RowChangeData<R extends RowData> = { [Property in keyof R]?: CellChange };

  type RowChange<R extends RowData, I extends EditableRowId = EditableRowId> = {
    readonly id: I;
    readonly data: RowChangeData<R>;
  };

  type DataChangePayload<R extends RowData, I extends EditableRowId = EditableRowId> = SingleOrArray<RowChange<R, I>>;

  type ConsolidatedChange<R extends RowData, I extends EditableRowId = EditableRowId> = RowChange<R, I>[];

  type DataChangeEvent<R extends RowData, I extends EditableRowId = EditableRowId> = {
    readonly type: "dataChange";
    readonly payload: DataChangePayload<R, I>;
  };

  type RowInsertPayload<R extends RowData> = {
    readonly previous: number;
    readonly data: Partial<R>;
    readonly group: GroupRowId | null;
  };

  /* RowInsertEvent differs from RowAddEvent because RowInsertEvent needs to
	   insert the row in the middle of the table, whereas RowAddEvent inserts the
		 row at the bottom of the table.  The difference is important, because with
		 the RowInsertEvent, we cannot add placeholders until there is an API
		 response - as we need the order of the inserted row from the API response
		 before it is inserted into the table. */
  type RowInsertEvent<R extends RowData> = {
    readonly type: "rowInsert";
    readonly payload: RowInsertPayload<R>;
  };

  type RowAddCountPayload = { readonly count: number };
  type RowAddIndexPayload = { readonly newIndex: number; readonly count?: number };
  type RowAddDataPayload<R extends RowData> = Partial<R>[];
  type RowAddPayload<R extends RowData> = RowAddCountPayload | RowAddIndexPayload | RowAddDataPayload<R>;

  type RowAddEvent<R extends RowData, P extends RowAddPayload<R> = RowAddPayload<R>> = {
    readonly type: "rowAdd";
    readonly payload: P;
    /* Placeholder IDs must be provided ahead of time so that the IDs are
			 consistent between the sagas and the reducer. */
    readonly placeholderIds: PlaceholderRowId[];
  };

  type RowAddDataEvent<R extends RowData> = RowAddEvent<R, RowAddDataPayload<R>>;

  type RowPositionChangedPayload = {
    readonly previous: number | null;
    readonly newGroup: GroupRowId | null;
    readonly id: ModelRowId;
  };

  type RowPositionChangedEvent = {
    readonly type: "rowPositionChanged";
    readonly payload: RowPositionChangedPayload;
  };

  type RowDeletePayload = {
    readonly rows: SingleOrArray<ModelRowId | MarkupRowId | GroupRowId | PlaceholderRowId>;
  };
  type RowDeleteEvent = {
    readonly type: "rowDelete";
    readonly payload: RowDeletePayload;
  };

  type RowRemoveFromGroupPayload = {
    readonly rows: SingleOrArray<ModelRowId>;
    readonly group: GroupRowId;
  };
  type RowRemoveFromGroupEvent = {
    readonly type: "rowRemoveFromGroup";
    readonly payload: RowRemoveFromGroupPayload;
  };

  type RowAddToGroupPayload = {
    readonly group: GroupRowId;
    readonly rows: SingleOrArray<ModelRowId>;
  };
  type RowAddToGroupEvent = {
    readonly type: "rowAddToGroup";
    readonly payload: RowAddToGroupPayload;
  };

  type GroupAddedPayload = Model.Group;
  type GroupAddedEvent = {
    readonly type: "groupAdded";
    readonly payload: GroupAddedPayload;
  };

  type MarkupAddedPayload = Model.Markup;
  type MarkupAddedEvent = {
    readonly type: "markupAdded";
    readonly payload: MarkupAddedPayload;
  };

  type ModelUpdatedPayload<M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly model: M;
    readonly group?: number | null;
  };

  type ModelUpdatedEvent<M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly type: "modelUpdated";
    readonly payload: SingleOrArray<ModelUpdatedPayload<M>>;
  };

  type ModelAddedPayload<M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly model: M;
    readonly group?: number | null;
  };

  type ModelAddedEvent<M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly type: "modelAdded";
    readonly payload: SingleOrArray<ModelAddedPayload<M>>;
  };

  type GroupUpdatedEvent = {
    readonly type: "groupUpdated";
    readonly payload: Model.Group;
  };

  type MarkupUpdatedEvent = {
    readonly type: "markupUpdated";
    readonly payload: Model.Markup;
  };

  type FullRowEvent = RowDeleteEvent | RowRemoveFromGroupEvent | RowAddToGroupEvent;

  type GroupEvent = RowRemoveFromGroupEvent | RowAddToGroupEvent | GroupUpdatedEvent | GroupAddedEvent;

  type ChangeEvent<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> =
    | DataChangeEvent<R>
    | RowAddEvent<R>
    | RowInsertEvent<R>
    | ModelAddedEvent<M>
    | RowDeleteEvent
    | RowPositionChangedEvent
    | RowRemoveFromGroupEvent
    | RowAddToGroupEvent
    | GroupAddedEvent
    | GroupUpdatedEvent
    | MarkupAddedEvent
    | MarkupUpdatedEvent
    | ModelUpdatedEvent<M>;

  type CellDoneEditingEvent = import("react").SyntheticEvent | KeyboardEvent;
}
