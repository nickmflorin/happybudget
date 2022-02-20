declare namespace Table {
  type Name = "account-subaccounts" | "accounts" | "subaccount-subaccounts" | "fringes" | "actuals" | "contacts";

  type AgGridProps = import("@ag-grid-community/react/lib/interfaces").AgGridReactProps;

  type GridOptions = import("@ag-grid-community/core").GridOptions;

  type TableOptionsSet = GridSet<import("@ag-grid-community/core").GridOptions>;

  type GeneralClassName = string | undefined | null;

  type RowNode = import("@ag-grid-community/core").RowNode;

  type MenuItemDef = import("@ag-grid-community/core").MenuItemDef | string;

  type GridReadyEvent = import("@ag-grid-community/core").GridReadyEvent;

  type FirstDataRenderedEvent = import("@ag-grid-community/core").FirstDataRenderedEvent;

  type CreateTableDataConfig<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly response: Http.TableResponse<M>;
    readonly columns: ModelColumn<R, M>[];
    readonly getModelRowChildren?: (m: M) => number[];
  };

  type RawClassName = string | string[] | undefined | { [key: string]: boolean };

  type ClassNameParamCallback<T> = (params: T) => ClassName<T>;

  // Copied directly from AG Grid Documentation and more strictly typed.
  interface AgEditorRef<V extends RawRowValue> {
    // Should return the final value to the grid, the result of the editing
    getValue(): V;
    /* Gets called once after initialised.
       If you return true, the editor will appear in a popup */
    isPopup?(): boolean;
    /* Gets called once, only if isPopup() returns true. Return "over" if the
       popup should cover the cell, or "under" if it should be positioned below
       leaving the cell value visible. If this method is not present, the
       default is "over" */
    getPopupPosition?(): string;
    /* Gets called once before editing starts, to give editor a chance to
       cancel the editing before it even starts. */
    isCancelBeforeStart?(): boolean;
    /* Gets called once when editing is finished (eg if Enter is pressed).
       If you return true, then the result of the edit will be ignored. */
    isCancelAfterEnd?(): boolean;
    // If doing full row edit, then gets called when tabbing into the cell.
    focusIn?(): boolean;
    // If doing full row edit, then gets called when tabbing out of the cell.
    focusOut?(): boolean;
  }

  /* ------------------------- Framework ------------------------------------ */
  type GridApi = import("@ag-grid-community/core").GridApi;
  type ColumnApi = import("@ag-grid-community/core").ColumnApi;
  type GridApis = {
    readonly grid: GridApi;
    readonly column: ColumnApi;
  };

  type FooterGridId = "footer" | "page";
  type GridId = "data" | FooterGridId;

  type GridSet<T> = { [key in GridId]: T };

  type FooterGridSet<T> = { [key in FooterGridId]: T };

  type TableApiSet = GridSet<GridApis | null>;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type FrameworkGroup = { [key: string]: React.ComponentType<any> };

  type GridFramework = {
    readonly editors?: FrameworkGroup;
    readonly cells?: FrameworkGroup;
  };

  type Framework = {
    readonly editors?: FrameworkGroup;
    readonly cells?: Partial<GridSet<FrameworkGroup>>;
  };

  interface ITableApis {
    readonly store: Partial<TableApiSet>;
    readonly get: (id: GridId) => GridApis | null;
    readonly set: (id: GridId, apis: GridApis) => void;
    readonly clone: () => ITableApis;
    readonly gridApis: GridApi[];
  }

  /* I really don't know why, but extending
		 import("@ag-grid-community/core").IEditorParams does not work here. */
  interface EditorParams<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > {
    readonly value: V;
    readonly keyPress: number | null;
    readonly charPress: string | null;
    readonly column: BodyColumn<R, M, V>;
    readonly columns: DataColumn<R, M>[];
    readonly colDef: import("@ag-grid-community/core").ColDef;
    readonly node: import("@ag-grid-community/core").RowNode;
    readonly data: R;
    readonly rowIndex: number;
    readonly api: import("@ag-grid-community/core").GridApi | null | undefined;
    readonly columnApi: import("@ag-grid-community/core").ColumnApi | null | undefined;
    readonly cellStartedEdit: boolean;
    readonly eGridCell: HTMLElement;
    readonly selector: (state: Application.Store) => S;
    readonly onKeyDown: (event: KeyboardEvent) => void;
    readonly stopEditing: (suppressNavigateAfterEdit?: boolean) => void;
    /* When the cell editor finishes editing, the AG Grid callback
			 (onCellDoneEditing) does not have any context about what event triggered
			 the completion, so we have to handle that ourselves so we can trigger
			 different behaviors depending on how the selection was performed. */
    readonly onDoneEditing: (e: CellDoneEditingEvent) => void;
  }

  interface CellProps<
    R extends RowData = RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any,
    C extends RealColumn<R, M, V> = BodyColumn<R, M, V>
  > extends Omit<import("@ag-grid-community/core").ICellRendererParams, "value">,
      StandardComponentProps {
    readonly loading?: boolean;
    readonly hideClear?: boolean;
    readonly customCol: C;
    readonly value: V;
    readonly gridId: GridId;
    readonly icon?: IconOrElement | ((row: BodyRow<R>) => IconOrElement | undefined | null);
    readonly innerCellClassName?: string | undefined | ((r: Row<R>) => string | undefined);
    readonly innerCellStyle?: React.CSSProperties | undefined | ((r: Row<R>) => React.CSSProperties | undefined);
    /* Note: This is only applied for the data grid rows/cells - so we have to
			 be careful.  We need a better way of establishing which props are
			 available to cells based on which grid they lie in. */
    readonly getRowColorDef: (row: BodyRow<R>) => RowColorDef;
    readonly selector: (state: Application.Store) => S;
    readonly onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    readonly onChangeEvent?: (event: ChangeEvent<R, M, Table.EditableRow<R>>) => void;
  }

  type CellWithChildrenProps<
    R extends RowData = RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any,
    C extends RealColumn<R, M, V> = BodyColumn<R, M, V>
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  > = Omit<CellProps<R, M, S, any, C>, "value"> & {
    readonly children: import("react").ReactNode;
  };

  type ValueCellProps<
    R extends RowData = RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    V extends string | number | null = string | number | null,
    C extends DataColumn<R, M, V> = BodyColumn<R, M, V>
  > = CellProps<R, M, S, V, C> & {
    /* This is used for extending cells.  Normally, the value formatter will be
			 included on the ColDef of the associated column.  But when extending a
			 Cell, we sometimes want to provide a formatter for that specific cell. */
    readonly valueFormatter?: AGFormatter;
  };
  /* ------------------------- Framework ------------------------------------ */

  /* ------------------------- Events --------------------------------------- */
  type ChangeEventId =
    | "dataChange"
    | "modelsUpdated"
    | "rowAdd"
    | "rowInsert"
    | "updateRows"
    | "modelsAdded"
    | "placeholdersActivated"
    | "rowPositionChanged"
    | "rowDelete"
    | "rowRemoveFromGroup"
    | "rowAddToGroup"
    | "groupUpdated"
    | "groupAdded"
    | "markupAdded"
    | "markupUpdated";

  type BaseEvent<
    T extends ChangeEventId = ChangeEventId,
    P extends Record<string, unknown> | Record<string, unknown>[] = Record<string, unknown> | Record<string, unknown>[]
  > = {
    readonly type: T;
    readonly payload: P;
  };

  type BaseChangeEvent = {
    readonly type: ChangeEventId;
  };

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type CellChange<V extends RawRowValue = any> = {
    readonly oldValue: V;
    readonly newValue: V;
  };

  type SoloCellChange<
    R extends RowData,
    RW extends Table.EditableRow<R> = Table.EditableRow<R>,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = CellChange<V> & {
    readonly field: keyof RW["data"];
    readonly id: RW["id"];
  };

  type RowChangeData<R extends RowData, RW extends Table.EditableRow<R> = Table.EditableRow<R>> = {
    [Property in keyof RW["data"]]?: CellChange;
  };

  type RowChange<R extends RowData, RW extends Table.EditableRow<R> = Table.EditableRow<R>> = {
    readonly id: RW["id"];
    readonly data: RowChangeData<R, RW>;
  };

  type DataChangePayload<R extends RowData, RW extends Table.EditableRow<R> = Table.EditableRow<R>> = SingleOrArray<
    RowChange<R, RW>
  >;

  type ConsolidatedChange<R extends RowData, RW extends Table.EditableRow<R> = Table.EditableRow<R>> = RowChange<
    R,
    RW
  >[];

  type DataChangeEvent<R extends RowData, RW extends Table.EditableRow<R> = Table.EditableRow<R>> = BaseEvent<
    "dataChange",
    DataChangePayload<R, RW>
  >;

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
  type RowInsertEvent<R extends RowData> = BaseEvent<"rowInsert", RowInsertPayload<R>>;

  type RowAddCountPayload = { readonly count: number };
  type RowAddIndexPayload = { readonly newIndex: number; readonly count?: number };
  type RowAddDataPayload<R extends RowData> = Partial<R>[];
  type RowAddPayload<R extends RowData> = RowAddCountPayload | RowAddIndexPayload | RowAddDataPayload<R>;

  type RowAddEvent<R extends RowData, P extends RowAddPayload<R> = RowAddPayload<R>> = BaseEvent<"rowAdd", P> & {
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

  type RowPositionChangedEvent = BaseEvent<"rowPositionChanged", RowPositionChangedPayload>;

  type RowDeletePayload = {
    readonly rows: SingleOrArray<ModelRowId | MarkupRowId | GroupRowId | PlaceholderRowId>;
  };
  type RowDeleteEvent = BaseEvent<"rowDelete", RowDeletePayload>;

  type RowRemoveFromGroupPayload = {
    readonly rows: SingleOrArray<ModelRowId>;
    readonly group: GroupRowId;
  };
  type RowRemoveFromGroupEvent = BaseEvent<"rowRemoveFromGroup", RowRemoveFromGroupPayload>;

  type RowAddToGroupPayload = {
    readonly group: GroupRowId;
    readonly rows: SingleOrArray<ModelRowId>;
  };
  type RowAddToGroupEvent = BaseEvent<"rowAddToGroup", RowAddToGroupPayload>;

  type GroupAddedPayload = Model.Group;
  type GroupAddedEvent = BaseEvent<"groupAdded", GroupAddedPayload>;

  type MarkupAddedPayload = Model.Markup;
  type MarkupAddedEvent = BaseEvent<"markupAdded", MarkupAddedPayload>;

  /* The Group is not attributed to a model in a detail response so we sometimes
     have to use the value from the original event. */
  type ModelChangeEventPayload<M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly model: M;
    readonly group?: number | null;
  };
  type ModelsAddedEvent<M extends Model.RowHttpModel = Model.RowHttpModel> = BaseEvent<
    "modelsAdded",
    SingleOrArray<ModelChangeEventPayload<M>>
  >;

  type ModelsUpdatedEvent<M extends Model.RowHttpModel = Model.RowHttpModel> = BaseEvent<
    "modelsUpdated",
    SingleOrArray<ModelChangeEventPayload<M>>
  >;

  type PlaceholdersActivatedPayload<M extends Model.RowHttpModel> = {
    readonly placeholderIds: Table.PlaceholderRowId[];
    readonly models: M[];
  };

  type PlaceholdersActivatedEvent<M extends Model.RowHttpModel = Model.RowHttpModel> = BaseEvent<
    "placeholdersActivated",
    PlaceholdersActivatedPayload<M>
  >;

  type UpdateRowPayload<R extends Table.RowData> = {
    readonly data: Partial<R>;
    readonly id: Table.ModelRowId;
  };

  type UpdateRowsEventPayload<R extends Table.RowData> = SingleOrArray<UpdateRowPayload<R>>;

  type UpdateRowsEvent<R extends Table.RowData> = BaseEvent<"updateRows", UpdateRowsEventPayload<R>>;

  type GroupUpdatedEvent = BaseEvent<"groupUpdated", Model.Group>;
  type MarkupUpdatedEvent = BaseEvent<"markupUpdated", Model.Markup>;

  type FullRowEvent = RowDeleteEvent | RowRemoveFromGroupEvent | RowAddToGroupEvent;

  type GroupEvent = RowRemoveFromGroupEvent | RowAddToGroupEvent | GroupUpdatedEvent | GroupAddedEvent;

  type ChangeEvent<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    RW extends Table.EditableRow<R> = Table.EditableRow<R>
  > =
    | DataChangeEvent<R, RW>
    | RowAddEvent<R>
    | RowInsertEvent<R>
    | UpdateRowsEvent<R>
    | PlaceholdersActivatedEvent<M>
    | ModelsAddedEvent<M>
    | ModelsUpdatedEvent<M>
    | RowDeleteEvent
    | RowPositionChangedEvent
    | RowRemoveFromGroupEvent
    | RowAddToGroupEvent
    | GroupAddedEvent
    | GroupUpdatedEvent
    | MarkupAddedEvent
    | MarkupUpdatedEvent;

  type CellDoneEditingEvent = import("react").SyntheticEvent | KeyboardEvent;
  /* ------------------------- Events --------------------------------------- */

  /* ------------------------- Columns -------------------------------------- */
  type AGFormatterParams = import("@ag-grid-community/core").ValueFormatterParams;
  type AGFormatter = (params: AGFormatterParams) => string;

  type NativeFormatterParams<P> = P | null;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type NativeFormatter<P> = (params: NativeFormatterParams<P>, onError?: OnFormatError) => string;

  type ColDef = import("@ag-grid-community/core").ColDef;

  type AgColumn = import("@ag-grid-community/core").Column;

  type ColumnDataTypeId =
    | "text"
    | "longText"
    | "singleSelect"
    | "phone"
    | "email"
    | "number"
    | "contact"
    | "currency"
    | "sum"
    | "percentage"
    | "file"
    | "date";

  type ColumnAlignment = "right" | "left" | null;
  type ColumnTypeId = "action" | "body" | "calculated" | "fake";

  interface ColumnDataType {
    readonly id: ColumnDataTypeId;
    readonly style?: React.CSSProperties;
    readonly icon?: IconOrElement;
    readonly pdfOverrides?: Omit<Partial<ColumnDataType>, "id">;
    readonly headerOverrides?: Omit<Partial<ColumnDataType>, "id" | "icon" | "pdfOverrides">;
  }

  type ColSpanParams<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel
  > = import("@ag-grid-community/core").ColSpanParams & {
    readonly columns: RealColumn<R, M>[];
  };

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  interface PdfFooterColumn<V extends RawRowValue = any> {
    readonly value?: V;
    readonly textStyle?: import("@react-pdf/types").Style;
  }

  type OmitColDefParams =
    | "field"
    | "colId"
    | "headerName"
    | "cellRenderer"
    | "cellClass"
    | "getCellClass"
    | "colSpan"
    | "editable"
    | "valueGetter"
    | "onCellDoubleClicked";

  type ParsedColumnField<
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = {
    field: string;
    value: V;
  };

  type HiddenColumns = { [key: string]: boolean };

  type EditColumnRowConfig<
    R extends RowData = RowData,
    RW extends NonPlaceholderBodyRow<R> = NonPlaceholderBodyRow<R>
  > = {
    readonly typeguard: (row: NonPlaceholderBodyRow<R>) => row is RW;
    readonly conditional?: (row: RW) => boolean;
    readonly behavior: EditRowActionBehavior;
    readonly action: (row: RW, hovered: boolean) => void;
    readonly tooltip?: string | ((row: RW, params: { hovered: boolean; disabled: boolean }) => string);
    readonly disabled?: boolean | ((row: RW, hovered: boolean) => boolean);
  };

  type ColumnCallbackParams<R extends RowData> = {
    readonly row: BodyRow<R>;
  };

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type InferR<C> = C extends Column<infer R, any, any> ? R : never;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type InferM<C> = C extends Column<any, infer M, any> ? M : never;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type InferV<C> = C extends Column<any, any, infer V> ? V : never;

  type InferRealColumn<C extends Column> = C extends BodyColumn<infer R, infer M, infer V>
    ? BodyColumn<R, M, V>
    : C extends CalculatedColumn<infer R, infer M, infer V>
    ? CalculatedColumn<R, M, V>
    : C extends ActionColumn<infer R, infer M>
    ? ActionColumn<R, M>
    : never;

  type InferActionColumn<C extends Column> = C extends ActionColumn<infer R, infer M> ? ActionColumn<R, M> : never;

  type InferBodyColumn<C extends Column> = C extends BodyColumn<infer R, infer M, infer V>
    ? BodyColumn<R, M, V>
    : never;

  type InferCalculatedColumn<C extends Column> = C extends CalculatedColumn<infer R, infer M, infer V>
    ? CalculatedColumn<R, M, V>
    : never;

  type InferDataColumn<C extends Column> = C extends BodyColumn<infer R, infer M, infer V>
    ? BodyColumn<R, M, V>
    : C extends CalculatedColumn<infer R, infer M, infer V>
    ? CalculatedColumn<R, M, V>
    : never;

  type BaseColumn = Omit<ColDef, OmitColDefParams>;

  type BaseRealColumn<
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    R extends RowData = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    M extends Model.RowHttpModel = any
  > = {
    readonly index?: number;
    readonly cellRenderer?: string | Partial<GridSet<string>>;
    readonly cellClass?: CellClassName;
    readonly footer?: FooterColumn<R, M>;
    readonly colSpan?: (params: ColSpanParams<R, M>) => number;
    readonly onCellFocus?: (params: CellFocusedParams<R, M>) => void;
    readonly onCellUnfocus?: (params: CellFocusedParams<R, M>) => void;
    readonly onCellDoubleClicked?: (row: ModelRow<R>) => void;
  };

  type BaseModelColumn<
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    M extends Model.RowHttpModel = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = {
    /* The field is used to pull data from the Model M in the case that the
		   getRowValue callback is not provided.  In the case of a BodyColumn or
			 CalculatedColumn, the field will only be used to pull data from the model
			 if the `isRead` field is `true`, otherwise, it will just be used as the
			 AG Grid colId. */
    readonly field: string;
    /* This value will be used in the case that undefined values are
       unexpectedly encountered (in which case an error will be issued) or
       another value that we treat as null is encountered (i.e. blank strings). */
    readonly nullValue: V;
    /* If not provided, the default behavior is to obtain the Row's value by
       attribute on the Model M corresponding to the Column's designated
			 `field`. */
    readonly getRowValue?: (m: M) => V;
    /* Callback to indicate whether or not the column is applicable for a given
       model.  If the column is not applicable, a warning will not be issued
       if the column's field cannot be obtained from the model. */
    readonly isApplicableForModel?: (m: M) => boolean;
    /* Callback to indicate whether or not the column is applicable for a given
       row type.  If the column is not applicable, the row will not include
			 the Column's field in it's data. */
    readonly isApplicableForRowType?: (rt: RowType) => boolean;
  };

  type FakeColumn<
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    M extends Model.RowHttpModel = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = BaseColumn &
    BaseModelColumn<M, V> & {
      readonly cType: "fake";
    };

  type PartialFakeColumn<
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    M extends Model.RowHttpModel = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = Omit<Partial<FakeColumn<M, V>>, "field" | "nullValue"> & Pick<FakeColumn<M, V>, "field" | "nullValue">;

  type ActionColumnId = "checkbox" | "edit" | "drag";

  type ActionColumn<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = BaseColumn &
    BaseRealColumn<R, M> & {
      readonly cType: "action";
      readonly colId: ActionColumnId;
    };

  type PartialActionColumn<
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    R extends RowData = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    M extends Model.RowHttpModel = any
  > = Omit<Partial<ActionColumn<R, M>>, "colId">;

  type BaseDataColumn<
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    R extends RowData = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    M extends Model.RowHttpModel = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = BaseModelColumn<M, V> & {
    // This field will be used to pull data from the Markup model if applicable.
    readonly markupField?: keyof Model.Markup;
    // This field will be used to pull data from the Group model if applicable.
    readonly groupField?: keyof Model.Group;
    /* This field, when false, indicates that the column value should not be
       pulled from the model, but is instead set by other means (usually
       value getters). */
    readonly isRead?: boolean;
    readonly headerName?: string;
    readonly pdfHeaderName?: string;
    readonly dataType?: ColumnDataTypeId;
    readonly page?: FooterColumn<R, M>;
    readonly defaultHidden?: boolean;
    readonly canBeHidden?: boolean;
    readonly canBeExported?: boolean;
    readonly requiresAuthentication?: boolean;
    readonly defaultNewRowValue?: boolean;
    readonly includeInPdf?: boolean;
    /* Callback to indicate whether or not the column is applicable for a given
       model.  If the column is not applicable, a warning will not be issued
       if the column's field cannot be obtained from the model. */
    readonly isApplicableForModel?: (m: M) => boolean;
    /* Callback to indicate whether or not the column is applicable for a given
       row type.  If the column is not applicable, the row will not include
			 the Column's field in it's data. */
    readonly isApplicableForRowType?: (rt: RowType) => boolean;
    readonly valueGetter?: (row: BodyRow<R>, rows: BodyRow<R>[]) => V;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    readonly getHttpValue?: (value: V) => any;
    readonly processCellForCSV?: (row: R) => string | number;
    readonly processCellForClipboard?: (row: R) => string | number;
    readonly pdfWidth?: number;
    readonly pdfFlexGrow?: true;
    readonly pdfFooter?: PdfFooterColumn<V>;
    readonly pdfCellProps?: PdfCellStandardProps<R, M, V>;
    readonly pdfHeaderCellProps?: PdfCellStandardProps<R, M, V>;
    readonly pdfCellRenderer?: (params: PdfCellCallbackParams<R, M, V>) => JSX.Element;
    readonly pdfFormatter?: NativeFormatter<V>;
    readonly pdfValueGetter?: (r: BodyRow<R>, rows: BodyRow<R>[]) => V;
    readonly pdfFooterValueGetter?: V | ((rows: BodyRow<R>[]) => V);
    /* NOTE: This only applies for the individual Account tables, not the the
			 overall Accounts */
    readonly pdfChildFooter?: (s: M) => PdfFooterColumn<V>;
  };

  type BodyColumn<
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    R extends RowData = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    M extends Model.RowHttpModel = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = BaseColumn &
    BaseRealColumn<R, M> &
    BaseDataColumn<R, M, V> & {
      readonly cType: "body";
      readonly selectable?: boolean | ((params: ColumnCallbackParams<R>) => boolean) | undefined;
      readonly editable?: boolean | ((params: ColumnCallbackParams<R>) => boolean);
      readonly smartInference?: boolean;
      readonly processCellFromClipboard?: (value: string) => V;
      /* The fields that the column is derive from.  Must be provided if
			   parseIntoFields is defined */
      readonly parsedFields?: string[];
      /* Callback that is used when a given column is derived from multiple other
				 columns.  The parser must take the value for the current column (which
				 is derived from the parsed columns) and parse the value such that the
				 contributing part from each parsed column is returned separately.

				 Must be provided if parsedFields is defined.
				 */
      readonly parseIntoFields?: (value: V) => ParsedColumnField<V>[];
      readonly onDataChange?: (id: ModelRowId, event: CellChange<V>) => void;
      readonly refreshColumns?: (change: CellChange<V>) => string[];
    };

  type PartialBodyColumn<
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    R extends RowData = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    M extends Model.RowHttpModel = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = Omit<Partial<BodyColumn<R, M, V>>, "field" | "nullValue"> & Pick<BodyColumn<R, M, V>, "field" | "nullValue">;

  type CalculatedColumn<
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    R extends RowData = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    M extends Model.RowHttpModel = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = BaseColumn &
    BaseRealColumn<R, M> &
    BaseDataColumn<R, M, V> & {
      readonly cType: "calculated";
    };

  type PartialCalculatedColumn<
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    R extends RowData = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    M extends Model.RowHttpModel = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = Omit<Partial<CalculatedColumn<R, M, V>>, "field" | "nullValue"> &
    Pick<CalculatedColumn<R, M, V>, "field" | "nullValue">;

  type DataColumn<
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    R extends RowData = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    M extends Model.RowHttpModel = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = BodyColumn<R, M, V> | CalculatedColumn<R, M, V>;

  type ModelColumn<
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    R extends RowData = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    M extends Model.RowHttpModel = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = DataColumn<R, M, V> | FakeColumn<M, V>;

  type RealColumn<
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    R extends RowData = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    M extends Model.RowHttpModel = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = BodyColumn<R, M, V> | CalculatedColumn<R, M, V> | ActionColumn<R, M>;

  type Column<
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    R extends RowData = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    M extends Model.RowHttpModel = any,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = BodyColumn<R, M, V> | ActionColumn<R, M> | CalculatedColumn<R, M, V> | FakeColumn<M, V>;

  interface FooterColumn<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel>
    extends Pick<DataColumn<R, M>, "colSpan"> {
    readonly cellStyle?: CellStyle;
  }

  type EditRowActionBehavior = "expand" | "edit";

  type ColumnVisibilityChange = {
    readonly field: string;
    readonly visible: boolean;
  };
  /* ------------------------- Columns -------------------------------------- */

  /* ------------------------- Cells -------------------------------------- */
  type CellPosition = Omit<import("@ag-grid-community/core").CellPosition, "rowPinned">;

  type CellKeyDownEvent = import("@ag-grid-community/core").CellKeyDownEvent;

  interface _CellClassNameArray<P> {
    [n: number]: RawClassName | ClassNameParamCallback<P>;
  }
  type ClassName<P> = RawClassName | ClassNameParamCallback<P> | _CellClassNameArray<P>;

  type CellClassName = ClassName<import("@ag-grid-community/core").CellClassParams>;

  type CellStyle = import("@ag-grid-community/core").CellStyle | import("@ag-grid-community/core").CellStyleFunc;

  type PdfCellCallbackParams<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = {
    readonly row?: Row<R>;
    readonly colIndex: number;
    readonly column: DataColumn<R, M, V>;
    readonly isHeader: boolean;
    readonly rawValue: V;
    readonly value: string;
    readonly indented: boolean;
  };

  type PdfCellCallback<
    RV,
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = (params: PdfCellCallbackParams<R, M, V>) => RV;

  type PdfOptionalCellCallback<
    RV,
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = RV | PdfCellCallback<RV, R, M, V> | undefined;

  interface _PdfCellClassName<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > {
    [n: number]: PdfOptionalCellCallback<string, R, M, V> | _PdfCellClassName<R, M, V>;
  }

  type PdfCellClassName<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = PdfOptionalCellCallback<string, R, M, V> | _PdfCellClassName<R, M, V>;

  interface _PdfCellStyle<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > {
    [n: number]: PdfOptionalCellCallback<import("@react-pdf/types").Style, R, M, V> | _PdfCellStyle<R, M, V>;
  }

  type PdfCellStyle<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = PdfOptionalCellCallback<import("@react-pdf/types").Style, R, M, V> | _PdfCellStyle<R, M, V>;

  type PdfCellStandardProps<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = {
    readonly style?: PdfCellStyle<R, M, V>;
    readonly className?: PdfCellClassName<R, M, V>;
    readonly textStyle?: PdfCellStyle<R, M, V>;
    readonly textClassName?: PdfCellClassName<R, M, V>;
  };

  type Cell<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly row: BodyRow<R>;
    readonly column: RealColumn<R, M>;
    readonly rowNode: import("@ag-grid-community/core").RowNode;
  };

  type CellFocusedParams<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly cell: Cell<R, M>;
    readonly apis: GridApis;
  };

  type CellFocusChangedParams<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly cell: Cell<R, M>;
    readonly previousCell: Cell<R, M> | null;
    readonly apis: GridApis;
  };
  /* ------------------------- Cells -------------------------------------- */

  /* ------------------------- Rows -------------------------------------- */
  type GetRowStyle = (params: RowClassParams) => import("react").CSSProperties | null | undefined;

  type RowClassParams = import("@ag-grid-community/core").RowClassParams;
  type RowClassName = ClassName<import("@ag-grid-community/core").RowClassParams>;
  type GetRowClassName = (params: RowClassParams) => RowClassName;

  interface RowColorDef {
    readonly backgroundColor?: string;
    readonly color?: string;
  }

  type PreviousValues<T> = [T, T] | [T];

  type DataRowType = "placeholder" | "model";

  type EditableRowType = "model" | "markup";
  type BodyRowType = DataRowType | "group" | "markup";
  type RowType = BodyRowType | "footer";

  type ModelRowId = number;
  type FooterRowId = `footer-${FooterGridId}`;
  type PlaceholderRowId = `placeholder-${number}`;
  type GroupRowId = `group-${number}`;
  type MarkupRowId = `markup-${number}`;

  type DataRowId = ModelRowId | PlaceholderRowId;
  type EditableRowId = ModelRowId | MarkupRowId;
  type NonPlaceholderBodyRowId = EditableRowId | GroupRowId;
  type BodyRowId = NonPlaceholderBodyRowId | PlaceholderRowId;

  type RowId = BodyRowId | FooterRowId;

  type RowNameLabelType = number | string | null;

  type RowStringGetter<R extends Row<RowData>> = RowNameLabelType | FnWithTypedArgs<RowNameLabelType, [R]>;

  type _RawRowValue = string | number | Array<string> | Array<number>;
  type _RowValueObj = Record<string, _RawRowValue | null>;
  type RawRowValue = _RawRowValue | null | _RowValueObj | Array<_RawRowValue> | Array<_RowValueObj>;
  type CalculatedColumnValue = number | null;

  type RowData = Record<string, RawRowValue>;

  type IRow<RId extends RowId, TP extends RowType, Grid extends GridId = GridId> = {
    readonly id: RId;
    readonly rowType: TP;
    readonly gridId: Grid;
  };

  type IBodyRow<RId extends RowId, TP extends BodyRowType, D extends RowData> = IRow<RId, TP, "data"> & {
    readonly data: D;
  };

  type FooterRow<Grid extends FooterGridId = FooterGridId> = IRow<FooterRowId, "footer", Grid>;

  type ModelRow<R extends RowData> = IBodyRow<ModelRowId, "model", R> & {
    readonly children: number[];
    readonly order: string;
    // This field is primarily used for logging purposes.
    readonly modelType: Model.RowHttpModelType;
  };

  type PlaceholderRow<R extends RowData> = IBodyRow<PlaceholderRowId, "placeholder", R> & {
    readonly children: [];
  };

  type GroupRow<R extends RowData> = IBodyRow<GroupRowId, "group", Pick<R, keyof Model.Group>> & {
    readonly children: number[];
    readonly groupData: Pick<Model.Group, "name" | "color">;
  };

  type MarkupRow<R extends RowData> = IBodyRow<MarkupRowId, "markup", Pick<R, keyof Model.Markup>> & {
    readonly children: number[];
    readonly markupData: Pick<Model.Markup, "unit" | "rate">;
  };

  type DataRow<D extends RowData> = ModelRow<D> | PlaceholderRow<D>;
  type EditableRow<D extends RowData> = ModelRow<D> | MarkupRow<D>;

  type NonPlaceholderBodyRow<D extends RowData> = ModelRow<D> | MarkupRow<D> | GroupRow<D>;

  type BodyRow<D extends RowData> = ModelRow<D> | PlaceholderRow<D> | GroupRow<D> | MarkupRow<D>;
  type Row<D extends RowData> = BodyRow<D> | FooterRow;

  type RowWithColor<D extends RowData> = ModelRow<D & { color: Style.HexColor | null }>;

  type RowWithName<D extends RowData> = ModelRow<D & { name: string | null }>;

  type RowWithDescription<D extends RowData> = ModelRow<D & { description: string | null }> | MarkupRow<D>;

  type RowWithIdentifier<D extends RowData> = ModelRow<D & { identifier: string | null }> | MarkupRow<D>;
  /* ------------------------- Rows -------------------------------------- */

  /* ------------------------- Multi-User ---------------------------------- */
  type ShareConfig<T extends Model.HttpModel & { readonly public_token: Model.PublicToken | null }> = {
    readonly instance: T;
    readonly onCreated?: (token: Model.PublicToken) => void;
    readonly onUpdated?: (token: Model.PublicToken) => void;
    readonly onDeleted?: () => void;
    readonly create: (
      id: number,
      payload: Http.PublicTokenPayload,
      options: Http.RequestOptions
    ) => Promise<Model.PublicToken>;
  };

  /* ------------------------- Multi-User ---------------------------------- */

  /* ------------------------- Redux -------------------------------------- */
  /* We need to allow any for RowDataSelector instead of Application.Store because
     there is a typing issue with reselect in regard to the footer row
		 selectors. */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type RowDataSelector<R extends RowData> = (state: any) => Partial<R>;

  type Context = Record<string, number | string>;

  type TaskConfig<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    C extends Context = Context,
    A extends Omit<Redux.TableActionMap<M, C>, "request"> = Omit<Redux.TableActionMap<M, C>, "request">
  > = Redux.TaskConfig<A> & {
    /* There are edge cases where the table will be null when switching between
		   tables very fast. */
    readonly table: TableInstance<R, M>;
  };

  type ReducerConfig<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    C extends Context = Context,
    A extends Redux.TableActionMap<M, C> = Redux.TableActionMap<M, C>
  > = Omit<TaskConfig<R, M, C, A>, "table"> & {
    readonly initialState: S;
    readonly columns: ModelColumn<R, M>[];
    readonly defaultData?: Partial<R>;
    readonly getModelRowChildren?: (m: M) => number[];
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    readonly clearOn: Redux.ClearOn<any, C>[];
  };

  type PublicSagaConfig<
    M extends Model.RowHttpModel = Model.RowHttpModel,
    C extends Context = Context,
    A extends Redux.TableActionMap<M, C> = Redux.TableActionMap<M, C>
  > = Redux.SagaConfig<Redux.TableTaskMap<C>, A>;

  type AuthenticatedSagaConfig<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    C extends Context = Context,
    A extends Redux.TableActionMapWithRequestOptional<
      Redux.AuthenticatedTableActionMap<R, M, C>,
      C
    > = Redux.TableActionMapWithRequestOptional<Redux.AuthenticatedTableActionMap<R, M, C>, C>,
    T extends Redux.TableTaskMapWithRequestOptional<
      Redux.AuthenticatedTableTaskMap<R, M, C>,
      C
    > = Redux.TableTaskMapWithRequestOptional<Redux.AuthenticatedTableTaskMap<R, M, C>, C>
  > = Redux.SagaConfig<T, A>;

  /* ------------------------- Redux -------------------------------------- */

  /* ------------------------- UI -------------------------------------- */
  type DataGridInstance = {
    readonly getCSVData: (fields?: string[]) => CSVData;
  };

  type TableInstance<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = DataGridInstance &
    UINotificationsManager & {
      readonly saving: (v: boolean) => void;
      readonly getColumns: () => ModelColumn<R, M>[];
      readonly getFocusedRow: () => BodyRow<R> | null;
      readonly getRow: (id: BodyRowId) => BodyRow<R> | null;
      readonly getRows: () => BodyRow<R>[];
      readonly getRowsAboveAndIncludingFocusedRow: () => BodyRow<R>[];
      readonly applyTableChange: (event: SingleOrArray<ChangeEvent<R, M>>) => void;
      readonly changeColumnVisibility: (changes: SingleOrArray<ColumnVisibilityChange>, sizeToFit?: boolean) => void;
    };

  /* We have to allow the onClick prop and ID prop to pass through the entire
		 component to the render method in the case that we are rendering a button
		 and we also specify wrapInDropdown.  This is so that AntD can control the
		 dropdown visibility via the button.and click aways can be properly
		 detected with the button ID. */
  type MenuActionRenderProps = {
    readonly id?: string;
    readonly onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  };

  type MenuActionRenderFunc = (props: MenuActionRenderProps) => JSX.Element;

  type MenuActionObj = {
    readonly index?: number;
    readonly icon?: IconOrElement;
    readonly tooltip?: DeterministicTooltip;
    readonly disabled?: boolean;
    readonly label?: string;
    readonly isWriteOnly?: boolean;
    readonly location?: "right" | "left";
    // If being wrapped in a Dropdown, the onClick prop will not be used.
    readonly onClick?: () => void;
    readonly wrapInDropdown?: (children: import("react").ReactChild | import("react").ReactChild[]) => JSX.Element;
    /* We have to allow the onClick prop and ID prop to pass through the entire
		   component to the render method in the case that we are rendering a button
			 and we also specify wrapInDropdown.  This is so that AntD can control the
			 dropdown visibility via the button.and click aways can be properly
			 detected with the button ID. */
    readonly render?: MenuActionRenderFunc;
  };

  type PublicMenuActionParams<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly apis: GridApis | null;
    readonly columns: DataColumn<R, M>[];
    readonly hiddenColumns?: HiddenColumns;
  };

  type AuthenticatedMenuActionParams<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel
  > = PublicMenuActionParams<R, M> & {
    readonly selectedRows: EditableRow<R>[];
  };

  type MenuActionCallback<
    V,
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    T extends PublicMenuActionParams<R, M> = PublicMenuActionParams<R, M>
  > = (params: T) => V;

  type MenuAction<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    T extends PublicMenuActionParams<R, M> = PublicMenuActionParams<R, M>
  > = MenuActionObj | MenuActionCallback<MenuActionObj, R, M, T>;

  type MenuActions<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    T extends PublicMenuActionParams<R, M> = PublicMenuActionParams<R, M>
  > = Array<MenuAction<R, M, T>> | MenuActionCallback<MenuAction<R, M, T>[], R, M, T>;

  type PublicMenuAction<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = MenuAction<
    R,
    M,
    PublicMenuActionParams<R, M>
  >;

  type AuthenticatedMenuAction<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = MenuAction<
    R,
    M,
    AuthenticatedMenuActionParams<R, M>
  >;

  type PublicMenuActions<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = MenuActions<
    R,
    M,
    PublicMenuActionParams<R, M>
  >;

  type AuthenticatedMenuActions<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = MenuActions<
    R,
    M,
    AuthenticatedMenuActionParams<R, M>
  >;

  type FooterGridConfig<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly id: "page" | "footer";
    readonly rowClass: RowClassName;
    readonly className: GeneralClassName;
    readonly rowHeight?: number;
    readonly getFooterColumn: (column: DataColumn<R, M>) => FooterColumn<R, M> | null;
  };
  /* ------------------------- UI -------------------------------------- */
}
