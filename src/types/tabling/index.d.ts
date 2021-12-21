declare namespace Table {
  type Name = "account-subaccounts" | "accounts" | "subaccount-subaccounts" | "fringes" | "actuals" | "contacts";
  type AsyncId = `async-${Name}-table`;

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
    readonly columns: Column<R, M>[];
    readonly getModelRowChildren?: (m: M) => number[];
  };

  type RawClassName = string | string[] | undefined | { [key: string]: boolean };

  type ClassNameParamCallback<T> = (params: T) => ClassName<T>;

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
    /* eslint-disable @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > {
    readonly value: V | null;
    readonly keyPress: number | null;
    readonly charPress: string | null;
    readonly column: Column<R, M, V>;
    readonly columns: Column<R, M>[];
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
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > extends Omit<import("@ag-grid-community/core").ICellRendererParams, "value">,
      StandardComponentProps {
    readonly loading?: boolean;
    readonly hideClear?: boolean;
    readonly customCol: Column<R, M, V>;
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
    readonly onChangeEvent?: (event: ChangeEvent<R, M>) => void;
  }

  type CellWithChildrenProps<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>
  > = Omit<CellProps<R, M, S>, "value"> & {
    readonly children: import("react").ReactNode;
  };

  type ValueCellProps<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>
  > = CellProps<R, M, S, string | number | null> & {
    /* This is used for extending cells.  Normally, the value formatter will be
			 included on the ColDef of the associated column.  But when extending a
			 Cell, we sometimes want to provide a formatter for that specific cell. */
    readonly valueFormatter?: AGFormatter;
  };
  /* ------------------------- Framework ------------------------------------ */

  /* ------------------------- Events --------------------------------------- */
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

  type CellChange<V extends RawRowValue = any> = {
    readonly oldValue: V;
    readonly newValue: V;
  };

  type SoloCellChange<
    R extends RowData,
    I extends EditableRowId = EditableRowId,
    V extends RawRowValue = any
  > = CellChange<V> & {
    readonly field: keyof R;
    readonly id: I;
  };

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
  /* ------------------------- Events --------------------------------------- */

  /* ------------------------- Columns -------------------------------------- */
  type AGFormatterParams = import("@ag-grid-community/core").ValueFormatterParams;
  type AGFormatter = (params: AGFormatterParams) => string;

  type NativeFormatterParams<P> = P | null;
  type NativeFormatter<P> = (params: NativeFormatterParams<P>) => string;

  type ColDef = import("@ag-grid-community/core").ColDef;

  type AgColumn = import("@ag-grid-community/core").Column;

  type ColumnTypeId =
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
  type TableColumnTypeId = "action" | "body" | "calculated" | "fake";

  interface ColumnType {
    readonly id: ColumnTypeId;
    readonly style?: React.CSSProperties;
    readonly icon?: IconOrElement;
    readonly pdfOverrides?: Omit<Partial<ColumnType>, "id">;
    readonly headerOverrides?: Omit<Partial<ColumnType>, "id" | "icon" | "pdfOverrides">;
  }

  type ColSpanParams<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel
  > = import("@ag-grid-community/core").ColSpanParams & {
    readonly columns: Column<R, M>[];
  };

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  interface PdfFooterColumn<V extends RawRowValue = any> {
    readonly value?: V | null;
    readonly textStyle?: import("@react-pdf/types").Style;
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type PdfValueGetter<R extends RowData, V extends RawRowValue = any> = (r: BodyRow<R>, rows: BodyRow<R>[]) => V | null;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type PdfFooterValueGetter<R extends RowData, V extends RawRowValue = any> = (rows: BodyRow<R>[]) => V | null;

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

  type ParsedColumnField<R extends RowData, V extends RawRowValue = any> = {
    field: keyof R;
    value: V;
  };

  type HiddenColumns = { [key: string]: boolean };

  type EditColumnRowConfig<R extends RowData, RW extends NonPlaceholderBodyRow<R> = NonPlaceholderBodyRow<R>> = {
    readonly conditional: (row: RW) => boolean;
    readonly hidden?: (row: RW, hovered: boolean) => boolean;
    readonly behavior: EditRowActionBehavior;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    readonly action: (row: any, hovered: boolean) => void;
    readonly tooltip?: string | ((row: RW, params: { hovered: boolean; disabled: boolean }) => string);
    readonly disabled?: boolean | ((row: RW, hovered: boolean) => boolean);
  };

  type ColumnCallbackParams<R extends RowData> = {
    readonly row: BodyRow<R>;
  };

  type InferColumnValue<C> = C extends Column<RowData, Model.RowHttpModel, infer V> ? V : never;

  type InferColumnRowData<C> = C extends Column<infer R, Model.RowHttpModel, RawRowValue> ? R : never;

  type Column<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends RawRowValue = any
  > = Omit<ColDef, OmitColDefParams> & {
    readonly field?: string;
    readonly colId?: string;
    readonly headerName?: string;
    readonly pdfHeaderName?: string;
    readonly columnType?: ColumnTypeId;
    readonly tableColumnType: TableColumnTypeId;
    readonly index?: number;
    readonly nullValue?: V;
    readonly selectable?: boolean | ((params: ColumnCallbackParams<R>) => boolean) | undefined;
    readonly editable?: boolean | ((params: ColumnCallbackParams<R>) => boolean);
    readonly footer?: FooterColumn<R, M>;
    readonly page?: FooterColumn<R, M>;
    readonly isRead?: boolean;
    readonly isWrite?: boolean;
    readonly cellRenderer?: string | Partial<GridSet<string>>;
    readonly cellClass?: CellClassName;
    readonly defaultHidden?: boolean;
    readonly canBeHidden?: boolean;
    readonly canBeExported?: boolean;
    readonly requiresAuthentication?: boolean;
    readonly smartInference?: boolean;
    readonly defaultNewRowValue?: boolean;
    readonly valueGetter?: (row: BodyRow<R>, rows: BodyRow<R>[]) => V;
    readonly getRowValue?: (m: M) => V;
    readonly getHttpValue?: (value: V) => Http.RawPayloadValue;
    readonly onDataChange?: (id: ModelRowId, event: CellChange<V>) => void;
    readonly colSpan?: (params: ColSpanParams<R, M>) => number;
    readonly onCellFocus?: (params: CellFocusedParams<R, M>) => void;
    readonly onCellUnfocus?: (params: CellFocusedParams<R, M>) => void;
    readonly refreshColumns?: (change: CellChange<V>) => string[];
    readonly parseIntoFields?: (value: V) => ParsedColumnField<R, V>[];
    readonly processCellForCSV?: (row: R) => string | number;
    readonly processCellForClipboard?: (row: R) => string | number;
    readonly processCellFromClipboard?: (value: string) => V;
    readonly onCellDoubleClicked?: (row: ModelRow<R>) => void;
    readonly includeInPdf?: boolean;
    /* In the PDF case, since we cannot dynamically resize columns, the width
			 refers to a ratio of the column width to the overall table width assuming
			 that all columns are present.  When columns are hidden/shown, this ratio
			 is adjusted. */
    readonly pdfWidth?: number;
    readonly pdfFlexGrow?: true;
    readonly pdfCellProps?: PdfCellStandardProps<R, M, V>;
    readonly pdfHeaderCellProps?: PdfCellStandardProps<R, M, V>;
    readonly pdfFooter?: PdfFooterColumn<V>;
    readonly pdfCellContentsVisible?: PdfOptionalCellCallback<boolean, R, M, V>;
    readonly pdfFormatter?: NativeFormatter<V>;
    readonly pdfValueGetter?: PdfValueGetter<R, V>;
    readonly pdfFooterValueGetter?: V | null | PdfFooterValueGetter<R, V>;
    readonly pdfCellRenderer?: (params: PdfCellCallbackParams<R, M, V>) => JSX.Element;
    /* NOTE: This only applies for the individual Account tables, not the the
			 overall Accounts */
    readonly pdfChildFooter?: (s: M) => PdfFooterColumn<V>;
  };

  interface FooterColumn<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel>
    extends Pick<Column<R, M>, "colSpan"> {
    readonly cellStyle?: CellStyle;
  }

  interface CookieNames {
    readonly hiddenColumns?: string;
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
    V extends RawRowValue = any
  > = {
    readonly row?: Row<R>;
    readonly colIndex: number;
    readonly column: Column<R, M, V>;
    readonly isHeader: boolean;
    readonly rawValue: V;
    readonly value: string;
    readonly indented: boolean;
  };

  type PdfCellCallback<
    RV,
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    V extends RawRowValue = any
  > = (params: PdfCellCallbackParams<R, M, V>) => RV;

  type PdfOptionalCellCallback<
    RV,
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    V extends RawRowValue = any
  > = RV | PdfCellCallback<RV, R, M, V> | undefined;

  interface _PdfCellClassName<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    V extends RawRowValue = any
  > {
    [n: number]: PdfOptionalCellCallback<string, R, M, V> | _PdfCellClassName<R, M, V>;
  }

  type PdfCellClassName<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    V extends RawRowValue = any
  > = PdfOptionalCellCallback<string, R, M, V> | _PdfCellClassName<R, M, V>;

  interface _PdfCellStyle<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    V extends RawRowValue = any
  > {
    [n: number]: PdfOptionalCellCallback<import("@react-pdf/types").Style, R, M, V> | _PdfCellStyle<R, M, V>;
  }
  type PdfCellStyle<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    V extends RawRowValue = any
  > = PdfOptionalCellCallback<import("@react-pdf/types").Style, R, M, V> | _PdfCellStyle<R, M, V>;

  type PdfCellStandardProps<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    V extends RawRowValue = any
  > = {
    readonly style?: PdfCellStyle<R, M, V>;
    readonly className?: PdfCellClassName<R, M, V>;
    readonly textStyle?: PdfCellStyle<R, M, V>;
    readonly textClassName?: PdfCellClassName<R, M, V>;
  };

  type Cell<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly row: BodyRow<R>;
    readonly column: Column<R, M>;
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
  };

  type PlaceholderRow<R extends RowData> = IBodyRow<PlaceholderRowId, "placeholder", R> & {
    readonly children: [];
  };

  type GroupRow<R extends RowData> = IBodyRow<GroupRowId, "group", R> & {
    readonly children: number[];
    readonly groupData: Pick<Model.Group, "name" | "color">;
  };

  type MarkupRow<R extends RowData> = IBodyRow<MarkupRowId, "markup", R> & {
    readonly children: number[];
    readonly markupData: Pick<Model.Markup, "unit" | "rate">;
  };

  type DataRow<D extends RowData> = ModelRow<D> | PlaceholderRow<D>;
  type EditableRow<D extends RowData> = ModelRow<D> | MarkupRow<D>;

  type NonPlaceholderBodyRow<D extends RowData> = ModelRow<D> | MarkupRow<D> | GroupRow<D>;

  type BodyRow<D extends RowData> = ModelRow<D> | PlaceholderRow<D> | GroupRow<D> | MarkupRow<D>;
  type Row<D extends RowData> = BodyRow<D> | FooterRow;

  type RowWithColor<D extends RowData> = BodyRow<D & { color: Style.HexColor | null }>;

  type RowWithName<D extends RowData> = BodyRow<D & { name: string | null }>;

  type RowWithDescription<D extends RowData> = BodyRow<D & { description: string | null }>;

  type RowWithIdentifier<D extends RowData> = BodyRow<D & { identifier: string | null }>;
  /* ------------------------- Rows -------------------------------------- */

  /* ------------------------- Redux -------------------------------------- */
  /* We need to allow any for RowDataSelector instead of Application.Store because
     there is a typing issue with reselect in regard to the footer row
		 selectors. */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type RowDataSelector<R extends RowData> = (state: any) => Partial<R>;

  type Context = Record<string, number>;

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
    readonly columns: Column<R, M>[];
    readonly defaultData?: Partial<R>;
    readonly getModelRowChildren?: (m: M) => number[];
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    readonly clearOn: Redux.ClearOn<any, C>[];
  };

  type SagaConfig<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    C extends Context = Context,
    A extends Omit<Redux.TableActionMap<M, C>, "request"> = Omit<Redux.TableActionMap<M, C>, "request">
  > = Redux.SagaConfig<Redux.TableTaskMap<R, M, C>, A>;

  type StoreConfig<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    C extends Context = Context,
    A extends Redux.TableActionMap<M, C> = Redux.TableActionMap<M, C>
  > = {
    readonly asyncId?: AsyncId;
    readonly actions: Omit<A, "request">;
    readonly footerRowSelectors?: Partial<FooterGridSet<RowDataSelector<R>>>;
    readonly onSagaConnected: (dispatch: import("redux").Dispatch, context: C) => void;
    readonly onSagaReconnected?: (dispatch: import("redux").Dispatch, context: C) => void;
    readonly selector?: (state: Application.Store) => S;
    readonly reducer?: Redux.Reducer<S>;
    readonly createSaga?: (t: TableInstance<R, M>) => import("redux-saga").Saga;
  };
  /* ------------------------- Redux -------------------------------------- */

  /* ------------------------- UI -------------------------------------- */
  type DataGridInstance = {
    readonly getCSVData: (fields?: string[]) => CSVData;
  };

  type TableInstance<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = DataGridInstance & {
    readonly removeNotification: () => void;
    readonly notify: (notification: TableNotification) => void;
    readonly getColumns: () => Column<R, M>[];
    readonly getFocusedRow: () => BodyRow<R> | null;
    readonly getRow: (id: BodyRowId) => BodyRow<R> | null;
    readonly getRows: () => BodyRow<R>[];
    readonly getRowsAboveAndIncludingFocusedRow: () => BodyRow<R>[];
    readonly applyTableChange: (event: SingleOrArray<ChangeEvent<R, M>>) => void;
    readonly changeColumnVisibility: (changes: SingleOrArray<ColumnVisibilityChange>, sizeToFit?: boolean) => void;
  };

  type MenuActionObj = {
    readonly index?: number;
    readonly icon: IconOrElement;
    readonly tooltip?: Tooltip;
    readonly disabled?: boolean;
    readonly label?: string;
    readonly isWriteOnly?: boolean;
    // If being wrapped in a Dropdown, the onClick prop will not be used.
    readonly onClick?: () => void;
    readonly wrapInDropdown?: (children: import("react").ReactChild | import("react").ReactChild[]) => JSX.Element;
    readonly render?: RenderFunc;
  };

  type MenuActionParams<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly apis: GridApis;
    readonly columns: Column<R, M>[];
    readonly hiddenColumns?: HiddenColumns;
  };

  type UnauthenticatedMenuActionParams<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel
  > = MenuActionParams<R, M>;

  type AuthenticatedMenuActionParams<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel
  > = MenuActionParams<R, M> & {
    readonly selectedRows: EditableRow<R>[];
  };

  type MenuActionCallback<
    V,
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    T extends MenuActionParams<R, M> = MenuActionParams<R, M>
  > = (params: T) => V;

  type MenuAction<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    T extends MenuActionParams<R, M> = MenuActionParams<R, M>
  > = MenuActionObj | MenuActionCallback<MenuActionObj, R, M, T>;

  type MenuActions<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    T extends MenuActionParams<R, M> = MenuActionParams<R, M>
  > = Array<MenuAction<R, M, T>> | MenuActionCallback<MenuAction<R, M, T>[], R, M, T>;

  type UnauthenticatedMenuAction<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = MenuAction<
    R,
    M,
    UnauthenticatedMenuActionParams<R, M>
  >;

  type AuthenticatedMenuAction<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = MenuAction<
    R,
    M,
    AuthenticatedMenuActionParams<R, M>
  >;

  type UnauthenticatedMenuActions<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = MenuActions<
    R,
    M,
    UnauthenticatedMenuActionParams<R, M>
  >;

  type AuthenticatedMenuActions<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = MenuActions<
    R,
    M,
    AuthenticatedMenuActionParams<R, M>
  >;

  interface DataGridConfig<R extends RowData> {
    readonly refreshRowExpandColumnOnCellHover?: (row: Row<R>) => boolean;
  }

  type AuthenticatedDataGridConfig<R extends RowData> = DataGridConfig<R> & {
    readonly rowCanDelete?: (row: EditableRow<R>) => boolean;
    readonly includeRowInNavigation?: (row: EditableRow<R>) => boolean;
  };

  type UnauthenticatedDataGridConfig<R extends RowData> = {
    readonly includeRowInNavigation?: (row: EditableRow<R>) => boolean;
  };

  type FooterGridConfig<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly id: "page" | "footer";
    readonly rowClass: RowClassName;
    readonly className: GeneralClassName;
    readonly rowHeight?: number;
    readonly getFooterColumn: (column: Column<R, M>) => FooterColumn<R, M> | null;
  };
  /* ------------------------- UI -------------------------------------- */
}
